import { extractIds, extractLabels } from "../relationHelpers";

describe("relation helpers", () => {
  test("extractIds handles objects and arrays", () => {
    expect(extractIds({ id: 1, name: "One" })).toEqual([1]);
    expect(extractIds([{ id: 2 }, { id: 3 }])).toEqual([2, 3]);
    expect(extractIds(null)).toEqual([]);
    expect(extractIds([1, 2])).toEqual([1, 2]);
  });

  test("extractLabels uses displayField and fallbacks", () => {
    const obj = { id: 1, title: "Hello", name: "ignored" };
    expect(extractLabels(obj, "title")).toEqual(["Hello"]);
    expect(extractLabels([{ id: 2, name: "A" }, { id: 3 }])).toEqual([
      "A",
      "3",
    ]);
    expect(extractLabels(null)).toEqual([]);
    expect(extractLabels([1, 2])).toEqual(["1", "2"]);
  });
});
