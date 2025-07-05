export interface IHasherService {
  hash(input: string): string;
  compare(input: string, hash: string): boolean;
}
