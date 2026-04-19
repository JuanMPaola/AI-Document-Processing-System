export interface AiProvider {
  summarize(text: string): Promise<string>;
}