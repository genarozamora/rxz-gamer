"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  user_id: string;
  subject: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export default function AyudaPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSupportChat = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!currentUser) {
        router.replace("/cuenta");
        return;
      }

      setUser(currentUser);

      const { data: currentConversation, error: conversationError } =
        await supabase
          .from("support_conversations")
          .select("id, user_id, subject, status, created_at, updated_at")
          .eq("user_id", currentUser.id)
          .eq("status", "open")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (!active) return;

      if (conversationError) {
        setError("No pudimos cargar tu conversación. Intentá nuevamente.");
        setLoading(false);
        return;
      }

      if (currentConversation) {
        setConversation(currentConversation as Conversation);

        const { data: conversationMessages, error: messagesError } =
          await supabase
            .from("support_messages")
            .select("id, conversation_id, sender_id, message, created_at")
            .eq("conversation_id", currentConversation.id)
            .order("created_at", { ascending: true });

        if (!active) return;

        if (messagesError) {
          setError("No pudimos cargar los mensajes. Intentá nuevamente.");
        } else {
          setMessages((conversationMessages ?? []) as Message[]);
        }
      }

      setLoading(false);
    };

    void loadSupportChat();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace("/cuenta");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`support-chat-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((current) =>
            current.some((item) => item.id === incoming.id)
              ? current
              : [...current, incoming],
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = draft.trim();
    if (!text || !user || sending) return;

    setSending(true);
    setError("");

    let activeConversation = conversation;

    if (!activeConversation) {
      const { data, error: createError } = await supabase
        .from("support_conversations")
        .insert({ user_id: user.id, subject: "Consulta" })
        .select("id, user_id, subject, status, created_at, updated_at")
        .single();

      if (createError || !data) {
        setError("No pudimos iniciar el chat. Intentá nuevamente.");
        setSending(false);
        return;
      }

      activeConversation = data as Conversation;
      setConversation(activeConversation);
    }

    const { data: sentMessage, error: sendError } = await supabase
      .from("support_messages")
      .insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        message: text,
      })
      .select("id, conversation_id, sender_id, message, created_at")
      .single();

    if (sendError || !sentMessage) {
      setError("El mensaje no se pudo enviar. Intentá nuevamente.");
    } else {
      setMessages((current) =>
        current.some((item) => item.id === sentMessage.id)
          ? current
          : [...current, sentMessage as Message],
      );
      setDraft("");
    }

    setSending(false);
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#050b14] px-4 text-white">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Cargando soporte…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b14] px-4 py-8 text-white sm:px-6">
      <section className="mx-auto flex min-h-[76vh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-emerald-400/20 bg-[#08121f] shadow-2xl shadow-cyan-950/30">
        <header className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 font-black text-[#031018] shadow-lg shadow-emerald-500/20">
              RXZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold sm:text-2xl">Soporte RXZ Gamer</h1>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Escribinos y el staff te responderá por acá.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-7">
          {messages.length === 0 ? (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-6 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-emerald-400/10 text-2xl">
                💬
              </div>
              <h2 className="font-semibold">¿En qué podemos ayudarte?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Contanos tu consulta con el mayor detalle posible. Tu conversación
                quedará guardada en tu cuenta.
              </p>
            </div>
          ) : (
            messages.map((item) => {
              const isMine = item.sender_id === user?.id;

              return (
                <div
                  key={item.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[72%] ${
                      isMine
                        ? "rounded-br-md bg-gradient-to-br from-emerald-500 to-cyan-600 text-white"
                        : "rounded-bl-md border border-white/10 bg-[#101d2d] text-slate-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {item.message}
                    </p>
                    <p
                      className={`mt-1 text-right text-[11px] ${
                        isMine ? "text-emerald-50/70" : "text-slate-500"
                      }`}
                    >
                      {isMine ? "Vos" : "Soporte"} · {formatTime(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <footer className="border-t border-white/10 bg-[#07101c] p-4 sm:p-6">
          {error && (
            <p className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <form onSubmit={sendMessage} className="flex items-end gap-3">
            <label className="sr-only" htmlFor="support-message">
              Escribí tu mensaje
            </label>
            <textarea
              id="support-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              maxLength={3000}
              disabled={sending}
              placeholder="Escribí tu consulta…"
              className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-[#0d1a29] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label="Enviar mensaje"
              className="grid h-12 min-w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 px-4 font-bold text-[#031018] shadow-lg shadow-emerald-500/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#031018] border-t-transparent" />
              ) : (
                <span aria-hidden="true" className="text-xl">
                  ➤
                </span>
              )}
            </button>
          </form>
          <p className="mt-2 px-1 text-xs text-slate-500">
            Enter para enviar · Shift + Enter para una nueva línea
          </p>
        </footer>
      </section>
    </main>
  );
}
