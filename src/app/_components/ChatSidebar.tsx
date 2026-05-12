"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, type ChatMessage } from "~/lib/supabase";

function getOrCreateNickname(): string {
  try {
    const key = "chat-nickname";
    const stored = localStorage.getItem(key);
    if (stored) return stored;
    const nick = `익명${Math.floor(Math.random() * 9000) + 1000}`;
    localStorage.setItem(key, nick);
    return nick;
  } catch {
    return `익명${Math.floor(Math.random() * 9000) + 1000}`;
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ChatSidebar() {
  const [messages,   setMessages]   = useState<ChatMessage[]>([]);
  const [input,      setInput]      = useState("");
  const [nickname,   setNickname]   = useState("");
  const [connected,  setConnected]  = useState(false);
  const [configured, setConfigured] = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const seenIds    = useRef<Set<number>>(new Set());

  const addMessage = (msg: ChatMessage) => {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    const nick = getOrCreateNickname();
    setNickname(nick);

    if (!supabase) {
      setConfigured(false);
      return;
    }

    void supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error: err }) => {
        if (err) { setError(`메시지 로드 실패: ${err.message}`); return; }
        if (data) {
          const sorted = (data as ChatMessage[]).reverse();
          sorted.forEach((m) => seenIds.current.add(m.id));
          setMessages(sorted);
        }
      });

    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => { addMessage(payload.new as ChatMessage); },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          setConnected(true); setError(null);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnected(false);
          setError(`Realtime 연결 실패 (${status})${err ? ": " + String(err) : ""}`);
        } else {
          setConnected(false);
        }
      });

    return () => { void supabase!.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !nickname || !supabase) return;

    const optimistic: ChatMessage = {
      id: Date.now(),
      nickname,
      content,
      created_at: new Date().toISOString(),
    };
    setInput("");
    addMessage(optimistic);

    const { data, error: err } = await supabase
      .from("chat_messages")
      .insert({ nickname, content })
      .select()
      .single();

    if (err) {
      setError(`전송 실패: ${err.message}`);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      seenIds.current.delete(optimistic.id);
      return;
    }

    if (data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? (data as ChatMessage) : m)),
      );
      seenIds.current.delete(optimistic.id);
      seenIds.current.add((data as ChatMessage).id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const content = (
    <>
      {/* 헤더 */}
      <div className="shrink-0 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">실시간 채팅</h2>
          <div className="flex items-center gap-2">
            <span
              title={connected ? "연결됨" : "연결 중..."}
              className={`h-2 w-2 rounded-full transition-colors ${
                connected ? "bg-green-400" : "bg-yellow-400 animate-pulse"
              }`}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-1 text-gray-400 hover:text-gray-600 md:hidden"
              aria-label="채팅 닫기"
            >
              ✕
            </button>
          </div>
        </div>
        <p className="mt-0.5 text-xs text-gray-400">{nickname || "로딩 중..."}</p>
      </div>

      {/* 에러 배너 */}
      {error && (
        <div className="shrink-0 border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          <p className="font-medium">오류</p>
          <p className="mt-0.5 break-all">{error}</p>
        </div>
      )}

      {/* 미설정 안내 */}
      {!configured && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-gray-500">
          <p className="font-medium">Supabase 설정이 필요합니다</p>
          <ol className="space-y-1 text-left text-xs text-gray-400">
            <li>1. supabase.com → 프로젝트 생성</li>
            <li>2. SQL Editor에서 테이블 생성</li>
            <li>3. Settings → API → 키 복사</li>
            <li>4. .env에 붙여넣기 후 재시작</li>
          </ol>
        </div>
      )}

      {/* 메시지 목록 */}
      {configured && (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {messages.length === 0 && !error && (
            <p className="mt-4 text-center text-xs text-gray-300">첫 메시지를 보내보세요!</p>
          )}
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.nickname === nickname;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
                >
                  {!isMine && (
                    <span className="text-xs font-medium text-gray-500">{msg.nickname}</span>
                  )}
                  <div
                    className={`max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm ${
                      isMine
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-300">{formatTime(msg.created_at)}</span>
                </div>
              );
            })}
          </div>
          <div ref={bottomRef} />
        </div>
      )}

      {/* 입력창 */}
      {configured && (
        <div className="shrink-0 border-t border-gray-200 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지 입력..."
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim()}
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="fixed bottom-0 right-0 top-16 hidden w-72 flex-col border-l border-gray-200 bg-white md:flex">
        {content}
      </aside>

      {/* 모바일 채팅 버튼 (FAB) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 md:hidden"
        aria-label="채팅 열기"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* 모바일 백드롭 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 모바일 드로어 */}
      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col bg-white shadow-xl transition-transform duration-300 sm:w-80 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}
