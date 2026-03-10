import type { Command } from "./types";

export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  register(command: Command): void {
    this.commands.set(command.name.en, command);
  }

  unregister(nameEn: string): void {
    this.commands.delete(nameEn);
  }

  registerAll(commands: Command[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }

  find(input: string): Command | undefined {
    for (const command of this.commands.values()) {
      if (command.name.en === input || command.name.th === input)
        return command;

      const enAliases = command.aliases?.en ?? [];
      const thAliases = command.aliases?.th ?? [];
      if (enAliases.includes(input) || thAliases.includes(input))
        return command;
    }
    return undefined;
  }

  all(): Command[] {
    return [...this.commands.values()];
  }

  allNames(): string[] {
    return this.all().flatMap((c) => [
      c.name.en,
      c.name.th,
      ...(c.aliases?.en ?? []),
      ...(c.aliases?.th ?? []),
    ]);
  }

  size(): number {
    return this.commands.size;
  }
}