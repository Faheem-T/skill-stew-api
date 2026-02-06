export interface IBloomFilter {
  add(item: string): void;
  has(item: string): boolean;
}
