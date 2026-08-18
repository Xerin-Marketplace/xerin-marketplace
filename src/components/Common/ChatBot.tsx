"use client";

import { useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
} from "lucide-react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-[calc(var(--xerin-mobile-nav-height)+var(--xerin-safe-bottom)+12px)] right-3 z-[9997] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff6c2f] to-[#ff8f57] text-white shadow-2xl transition-all duration-300 hover:shadow-orange-400/40 sm:right-4 sm:h-14 sm:w-14 lg:bottom-6 lg:right-6 lg:h-16 lg:w-16 lg:hover:scale-110"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-[calc(var(--xerin-mobile-nav-height)+var(--xerin-safe-bottom)+72px)] left-3 right-3 z-[9997] flex max-h-[70dvh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] animate-in fade-in slide-in-from-bottom-5 duration-300 sm:left-auto sm:right-4 sm:h-[560px] sm:w-[360px] lg:bottom-28 lg:right-6 lg:h-[620px] lg:w-[380px] lg:max-h-none lg:rounded-3xl">

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#ff6c2f] to-[#ff8f57] px-4 py-3 text-white sm:px-5 sm:py-4">

            <div className="flex items-center gap-3">

              {/* Logo */}
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#ff6c2f] shadow-lg sm:h-12 sm:w-12">
                  <Bot size={26} />
                </div>

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
              </div>

              <div>
                <h3 className="text-base font-semibold sm:text-lg">
                  Xerin Assistant
                </h3>

                <p className="text-xs text-orange-100">
                  Online • Usually replies instantly
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 sm:space-y-5 sm:p-5">

            {/* Welcome Message */}
            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6c2f] text-white">
                <Bot size={20} />
              </div>

              <div className="max-w-[calc(100vw-96px)] rounded-2xl rounded-tl-md bg-white p-3 shadow sm:max-w-[250px] sm:p-4">

                <p className="text-sm text-gray-700">
                  👋 Hello and welcome to
                  <span className="font-semibold text-[#ff6c2f]">
                    {" "}Xerin Marketplace
                  </span>
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  I'm here to help you find products, answer questions,
                  and assist you with your shopping experience.
                </p>

                <span className="mt-3 block text-xs text-gray-400">
                  Just now
                </span>

              </div>
            </div>

          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 sm:p-4">

            <div className="flex items-center gap-3 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus-within:border-[#ff6c2f]">

              <input
                type="text"
                placeholder="Type your message..."
                className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm"
              />

              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6c2f] text-white transition hover:bg-[#e95d22]">
                <Send size={18} />
              </button>

            </div>

            <p className="mt-3 text-center text-[11px] text-gray-400">
              Powered by Xerin AI Assistant
            </p>

          </div>

        </div>
      )}
    </>
  );
}