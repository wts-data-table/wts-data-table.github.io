import { describe, expect, it } from "vitest";
import {
  createDemoRuntimeOptions,
  createFrameworkSnippet,
  FRAMEWORKS,
} from "./example-config";
import { TABLE_DEMOS } from "./site-data";

describe("framework example snippets", () => {
  const grouping = TABLE_DEMOS.find(({ id }) => id === "grouping")!;

  it("lists a dedicated card demo with working card lifecycle code in every framework", () => {
    const demo = TABLE_DEMOS.find(({ id }) => id === "card-view")!;
    expect(demo.title).toBe("Card view");
    expect(createDemoRuntimeOptions(demo.id).viewMode).toBe("cards");
    for (const framework of FRAMEWORKS) {
      const code = createFrameworkSnippet(framework, demo, createDemoRuntimeOptions(demo.id));
      expect(code).toContain("from 'wts-data-table/card-view'");
      expect(code).toContain("createDataTableCardView({");
      expect(code).toContain("mode: 'cards'");
      expect(code).toContain("breakpoint: 720");
      expect(code).toContain("showToggle: false");
      expect(code).toMatch(/cards(?:\.current)?\??\.destroy\(\)/);
      expect(createFrameworkSnippet(framework, demo, {
        ...createDemoRuntimeOptions(demo.id), viewMode: 'auto'
      })).toContain("mode: 'auto'");
    }
  });

  it("generates wrapper-specific imports while retaining example options", () => {
    const runtime = createDemoRuntimeOptions("grouping");
    expect(createFrameworkSnippet("Angular", grouping, runtime)).toContain(
      "from '@wts-data-table/angular'",
    );
    expect(createFrameworkSnippet("React", grouping, runtime)).toContain(
      "<WtsDataTableReact",
    );
    expect(createFrameworkSnippet("Vue", grouping, runtime)).toContain(
      "<WtsDataTableVue",
    );
    expect(createFrameworkSnippet("Vanilla TS", grouping, runtime)).toContain(
      "grouping: ['status']",
    );
  });

  it("reflects live option changes in generated code", () => {
    const runtime = {
      ...createDemoRuntimeOptions("grouping"),
      pagination: false,
      pageSize: 14 as const,
    };
    const code = createFrameworkSnippet("React", grouping, runtime);
    expect(code).toContain("pagination: false");
    expect(code).toContain("pageSize: 14");
  });

  it("exposes the major search, interaction, layout, and performance options", () => {
    const runtime = {
      ...createDemoRuntimeOptions("portfolio"),
      advancedFiltering: true,
      searchPanes: true,
      cellSelection: true,
      editing: true,
      autoFill: true,
      grouping: true,
      rowExpansion: true,
      rowReordering: true,
      rowPinning: true,
      stickyFooter: true,
      virtualization: true,
    };
    const code = createFrameworkSnippet("Vanilla TS", grouping, runtime);

    expect(code).toContain("advancedFiltering: { showBuilder: true");
    expect(code).toContain("searchPanes: { columns:");
    expect(code).toContain("cellSelection: true");
    expect(code).toContain("autoFill: true");
    expect(code).toContain("showGrouping: true");
    expect(code).toContain("rowExpansion: { allowMultiple: true");
    expect(code).toContain("getRowCanExpand: () => true");
    expect(code).toContain("rowReordering: true");
    expect(code).toContain("rowPinning: true");
    expect(code).toContain("stickyFooter: true");
    expect(code).toContain("virtualization: { height: 420");
  });
});
