export interface Game {
  id: number;
  title: string;
  system: string;
  rom_path: string;
  box_art_path: string | null;
  last_played: string | null;
}