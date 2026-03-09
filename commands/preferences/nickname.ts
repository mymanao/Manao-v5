import { getNickname, setNickname } from "@/db";
import { i18n } from "@/i18n";
import type { Command } from "@/core/types";

export default {
  name: { en: "nickname", th: "ชื่อเล่น" },
  description: { en: "Change or show your nickname", th: "เปลี่ยนหรือแสดงชื่อเล่นของคุณ" },
  aliases: { en: ["nick", "name"], th: ["ชื่อ"] },
  arguments: [
    {
      name: { en: "nickname", th: "ชื่อเล่น" },
      description: { en: "Your new nickname", th: "ชื่อเล่นใหม่ของคุณ" },
      required: false,
    },
  ],
  execute: async (ctx, args) => {
    const t = i18n[ctx.language];
    const name = args.join(" ");

    if (!args[0]) {
      const nickname = getNickname(ctx.user.id);
      await ctx.reply(t.configuration.currentNickname(nickname || ctx.user.name));
      return;
    }

    if (["remove", "reset", "clear"].includes(name)) {
      setNickname(ctx.user.id, null);
      await ctx.reply(t.configuration.currentNicknameRemoved());
      return;
    }

    if (name.length > 32) {
      await ctx.reply(t.configuration.errorNicknameTooLong());
      return;
    }

    if (!/^[a-zA-Z0-9ก-๙ ]+$/.test(name)) {
      await ctx.reply(t.configuration.errorNicknameContainsSpecialChars());
      return;
    }

    setNickname(ctx.user.id, name);
    ctx.emit("feed", { status: "normal", icon: "✍️", name: `${ctx.user.name} (${name})`, action: "Rename" });
    await ctx.reply(t.configuration.currentNicknameChanged(name));
  },
} satisfies Command;
