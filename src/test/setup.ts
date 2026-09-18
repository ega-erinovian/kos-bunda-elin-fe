import "@testing-library/jest-dom/vitest";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/mocks/server";
import { resetFixtures } from "@/mocks/fixtures/reset";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  resetFixtures();
});
afterAll(() => server.close());
