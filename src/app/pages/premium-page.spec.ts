import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { PremiumPage } from "./premium-page";

describe("PremiumPage", () => {
  it("demonstrates every licensed capability group with code and a product image", async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumPage],
    }).compileComponents();
    const fixture = TestBed.createComponent(PremiumPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent ?? "";

    expect(text).toContain("Every shipped feature.");
    expect(text).toContain("10 / 10");
    for (const capability of [
      "Advanced row model",
      "Indexed search",
      "Background export",
      "Worker processing",
      "Live data",
      "Server analytics",
      "Spreadsheet formulas",
      "Collaborative editing",
      "Governed editing",
      "Report designer",
    ]) {
      expect(text).toContain(capability);
    }
    expect(element.querySelectorAll(".premium-list article")).toHaveLength(10);
    expect(element.querySelectorAll(".premium-list img")).toHaveLength(10);
    expect(element.querySelectorAll(".code-block")).toHaveLength(10);
    expect(element.querySelectorAll(".runtime-options")).toHaveLength(10);
    expect(text).toContain("One package, explicit entitlement");
  });
});
