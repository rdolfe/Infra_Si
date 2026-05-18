import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OfferModal from "@/components/offers/OfferModal";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    postForm: jest.fn(),
  },
}));

const defaultProps = {
  propertyId: "prop-1",
  propertyTitle: "Appartement Test",
  open: true,
  onClose: jest.fn(),
};

describe("OfferModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation error when submitting with empty price", async () => {
    const { container } = render(<OfferModal {...defaultProps} />);

    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(screen.getByText("Veuillez saisir un prix valide.")).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it("calls api.post and shows success state with valid price", async () => {
    (api.post as jest.Mock).mockResolvedValue({ ok: true });

    const { container } = render(<OfferModal {...defaultProps} />);

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "250000" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(screen.getByText("Offre envoyée !")).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith("/api/offers", {
      property_id: "prop-1",
      proposed_price: 250000,
      message: undefined,
    });
  });
});
