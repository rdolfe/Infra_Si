import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/property/FilterSidebar";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("FilterSidebar", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({ get: (_key: string) => null });
    mockPush.mockClear();
  });

  it("renders all filter controls", () => {
    render(<FilterSidebar />);

    expect(screen.getByPlaceholderText("Paris, Lyon…")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();

    expect(screen.getByRole("combobox")).toBeInTheDocument();

    for (const n of [1, 2, 3, 4, 5]) {
      expect(screen.getByRole("button", { name: `${n}+` })).toBeInTheDocument();
    }

    for (const rating of ["A", "B", "C", "D", "E", "F", "G"]) {
      expect(screen.getByRole("button", { name: rating })).toBeInTheDocument();
    }

    expect(screen.getByRole("checkbox")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Appliquer" })).toBeInTheDocument();
  });

  it("changing min price and applying updates URL params", () => {
    render(<FilterSidebar />);

    const minPriceInput = screen.getByPlaceholderText("Min");
    fireEvent.change(minPriceInput, { target: { value: "100000" } });

    fireEvent.click(screen.getByRole("button", { name: "Appliquer" }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    const calledWith: string = mockPush.mock.calls[0][0];
    expect(calledWith).toContain("min_price=100000");
  });
});
