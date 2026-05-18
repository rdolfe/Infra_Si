import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationBell from "@/components/ui/NotificationBell";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    postForm: jest.fn(),
  },
}));

const mockNotifications = [
  {
    id: "notif-1",
    type: "new_offer",
    payload: { message: "Nouvelle offre reçue" },
    read: false,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "notif-2",
    type: "offer_countered",
    payload: {},
    read: true,
    created_at: "2024-01-14T09:00:00Z",
  },
];

describe("NotificationBell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockNotifications),
    });
    (api.put as jest.Mock).mockResolvedValue({});
  });

  it("shows unread count badge when notifications are present", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /1 non lues/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens dropdown and calls read-all API when bell is clicked", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /1 non lues/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /1 non lues/i }));

    expect(screen.getByRole("menu")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/api/notifications/read-all", {});
    });
  });
});
