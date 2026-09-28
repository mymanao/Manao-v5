import { incrementCustomReplyCounter } from "@/db";
import { i18n } from "@/i18n";
import type { CommandUser, CustomReplies, Language } from "./types";

type CounterState = Map<string, number>;
export const runtimeCustomReplyCounters: CounterState = new Map();

function replyKey(reply: CustomReplies): string {
  return reply.id || `${reply.keywords.join(",")}:${reply.responses.join(",")}`;
}

export async function buildCustomReplyResponse(
  reply: CustomReplies,
  userId: string,
  requester: Pick<CommandUser, "name" | "platform" | "platformID">,
  language: Language,
  sequenceIndex: Map<string, number>,
  runtimeCounters: CounterState,
): Promise<string> {
  let response = "";
  if (reply.responseType === "random") {
    response =
      reply.responses[Math.floor(Math.random() * reply.responses.length)] ?? "";
  } else {
    const key = replyKey(reply);
    const idx = sequenceIndex.get(key) ?? 0;
    response = reply.responses[idx] ?? "";
    if (reply.responses.length > 0) {
      sequenceIndex.set(key, (idx + 1) % reply.responses.length);
    }
  }

  if (!response) return response;

  let counter: string | undefined;
  if (reply.counterEnabled) {
    const key = `${replyKey(reply)}:${userId}`;
    const count = reply.keepCounter
      ? incrementCustomReplyCounter(replyKey(reply), userId)
      : (runtimeCounters.get(key) ?? 0) + 1;
    if (!reply.keepCounter) runtimeCounters.set(key, count);
    counter = String(count);
  }

  const mention =
    requester.platform === "discord"
      ? `<@${requester.platformID}>`
      : `@${requester.name}`;

  let rendered = response
    .replaceAll("[user]", mention)
    .replaceAll("[username]", requester.name);

  if (counter) {
    rendered = rendered.includes("[counter]")
      ? rendered.replaceAll("[counter]", counter)
      : `${rendered} (${counter} ${i18n[language].misc.times()})`;
  }

  return rendered;
}
