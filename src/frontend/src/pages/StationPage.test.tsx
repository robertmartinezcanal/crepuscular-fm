import { renderWithActor } from "@/__tests__/test-utils";
import StationPage from "@/pages/StationPage";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("StationPage", () => {
  it("shows frequency, city, phone, email and address", () => {
    renderWithActor(<StationPage />, {});

    expect(screen.getByTestId("station.fact.frecuencia")).toHaveTextContent(
      "99.5 FM",
    );
    expect(screen.getByTestId("station.fact.ciudad")).toHaveTextContent(
      "Barquisimeto",
    );
    expect(screen.getByTestId("station.phone_link")).toHaveTextContent(
      "+58 251 123 4567",
    );
    expect(screen.getByTestId("station.email_link")).toHaveTextContent(
      "contacto@radiocrepuscular.com",
    );
    expect(screen.getByTestId("station.address_card")).toHaveTextContent(
      "Barquisimeto, Estado Lara, Venezuela",
    );
  });

  it("exposes actionable contact links", () => {
    renderWithActor(<StationPage />, {});

    expect(screen.getByTestId("station.phone_link")).toHaveAttribute(
      "href",
      "tel:+582511234567",
    );
    expect(screen.getByTestId("station.email_link")).toHaveAttribute(
      "href",
      "mailto:contacto@radiocrepuscular.com",
    );
    expect(screen.getByTestId("station.tiktok_link")).toHaveAttribute(
      "href",
      "https://www.tiktok.com/@RadioCrepuscularFM",
    );
  });
});
