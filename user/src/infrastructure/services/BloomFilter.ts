import { IBloomFilter } from "../../application/ports/IBloomFilter";
import BF from "bloom-filters";

export class BloomFilter implements IBloomFilter {
  private _filter: BF.BloomFilter;

  constructor(expectedNumberOfItems: number, desiredErrorRate: number) {
    this._filter = BF.BloomFilter.create(
      expectedNumberOfItems,
      desiredErrorRate,
    );
  }

  has(item: string): boolean {
    return this._filter.has(item);
  }

  add(item: string): void {
    return this._filter.add(item);
  }
}
