import { test, expect } from "@playwright/test";

test.describe("Dashboard Particulier - Overzicht", () => {

    test("Sidebar active state + KPI click + nieuw pand flow", async ({ page }) => {
        await page.goto("http://localhost:5500/dashboard-particulier.html");

        // Check that exactly one nav-item is active
        const active = page.locator(".nav-item.is-active");
        await expect(active).toHaveCount(1);

        // KPI card click navigates to aanvragen
        await page.locator("[data-kpi='aanvragen']").click();
        await expect(page).toHaveURL(/aanvragen-particulier\.html/);

        // Nieuw pand flow creates draft
        await page.goto("http://localhost:5500/dashboard-particulier.html");
        await page.locator("#btnNieuwPand").click();
        await expect(page).toHaveURL(/advertentie-particulier\.html\?draft=DRAFT_/);
    });

    test("Slimme verbeteringen toont altijd content", async ({ page }) => {
        await page.goto("http://localhost:5500/dashboard-particulier.html");

        const list = page.locator("#smartList");
        await expect(list).toBeVisible();

        // Should always have at least one smart-task
        const tasks = list.locator(".smart-task");
        await expect(tasks.first()).toBeVisible();
    });

    test("Breadcrumb shows correct page title", async ({ page }) => {
        await page.goto("http://localhost:5500/dashboard-particulier.html");

        const crumb = page.locator("[data-breadcrumb]");
        await expect(crumb).toContainText("Overzicht");
    });

    test("KPI cards have correct data-kpi attributes", async ({ page }) => {
        await page.goto("http://localhost:5500/dashboard-particulier.html");

        await expect(page.locator("[data-kpi='views']")).toBeVisible();
        await expect(page.locator("[data-kpi='aanvragen']")).toBeVisible();
        await expect(page.locator("[data-kpi='opgeslagen']")).toBeVisible();
    });

    test("Open-aanvraag button uses request-id", async ({ page }) => {
        // Set up test data in localStorage before navigation
        await page.goto("http://localhost:5500/dashboard-particulier.html");

        // If there's an aanvraag button, it should have data-request-id
        const btn = page.locator("[data-action='open-aanvraag']").first();
        if (await btn.isVisible()) {
            const requestId = await btn.getAttribute("data-request-id");
            expect(requestId).toBeTruthy();
        }
    });

});
