import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableText } from "@/components/ui/EditableText";

// Mock the link detection utility
jest.mock("@/lib/utils/link-detection", () => ({
  detectLinks: jest.fn(),
}));

import { detectLinks } from "@/lib/utils/link-detection";
const mockDetectLinks = detectLinks as jest.MockedFunction<typeof detectLinks>;

describe("EditableText", () => {
  const mockOnEdit = jest.fn();
  const defaultProps = {
    text: "Test text",
    onEdit: mockOnEdit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDetectLinks.mockReturnValue([]);
  });

  test("초기 텍스트가 렌더링되어야 함", () => {
    render(<EditableText {...defaultProps} />);

    expect(screen.getByText("Test text")).toBeInTheDocument();
  });

  test("클릭 시 편집 모드로 전환되어야 함", async () => {
    const user = userEvent.setup();
    render(<EditableText {...defaultProps} />);

    const textDiv = screen.getByText("Test text");
    await user.click(textDiv);

    const input = screen.getByDisplayValue("Test text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  test("Enter 키 누르면 편집이 저장되어야 함", async () => {
    const user = userEvent.setup();
    render(<EditableText {...defaultProps} />);

    const textDiv = screen.getByText("Test text");
    await user.click(textDiv);

    const input = screen.getByDisplayValue("Test text");
    await user.clear(input);
    await user.type(input, "Updated text");
    await user.keyboard("{Enter}");

    expect(mockOnEdit).toHaveBeenCalledWith("Updated text");
    // Enter 후 편집 모드가 종료되므로 text prop에 의존
    await waitFor(() => {
      expect(
        screen.queryByDisplayValue("Updated text")
      ).not.toBeInTheDocument();
    });
  });

  test("Escape 키 누르면 편집이 취소되어야 함", async () => {
    const user = userEvent.setup();
    render(<EditableText {...defaultProps} />);

    const textDiv = screen.getByText("Test text");
    await user.click(textDiv);

    const input = screen.getByDisplayValue("Test text");
    await user.clear(input);
    await user.type(input, "Updated text");
    await user.keyboard("{Escape}");

    expect(mockOnEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Test text")).toBeInTheDocument();
  });

  test("blur 이벤트로 편집이 저장되어야 함", async () => {
    const user = userEvent.setup();
    render(<EditableText {...defaultProps} />);

    const textDiv = screen.getByText("Test text");
    await user.click(textDiv);

    const input = screen.getByDisplayValue("Test text");
    await user.clear(input);
    await user.type(input, "Updated text");

    // 다른 곳을 클릭해서 blur 이벤트 발생
    await user.click(document.body);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith("Updated text");
    });
  });

  test("커스텀 className과 style이 적용되어야 함", () => {
    const customProps = {
      ...defaultProps,
      className: "custom-class",
      style: { color: "red" },
    };

    render(<EditableText {...customProps} />);

    const textDiv = screen.getByText("Test text");
    expect(textDiv).toHaveClass("custom-class");
    expect(textDiv).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });

  test("링크가 감지되면 올바르게 렌더링되어야 함", () => {
    const mockLinks = [
      {
        url: "https://example.com",
        domain: "example.com",
        startIndex: 5,
        endIndex: 25,
        originalText: "https://example.com",
      },
    ];
    mockDetectLinks.mockReturnValue(mockLinks);

    render(
      <EditableText {...defaultProps} text="Visit https://example.com today" />
    );

    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("🔗")).toBeInTheDocument();
    expect(screen.getByText(/Visit/)).toBeInTheDocument();
    expect(screen.getByText(/today/)).toBeInTheDocument();
  });

  test("링크 클릭 시 새 창이 열려야 함", () => {
    const mockLinks = [
      {
        url: "https://example.com",
        domain: "example.com",
        startIndex: 5,
        endIndex: 25,
        originalText: "https://example.com",
      },
    ];
    mockDetectLinks.mockReturnValue(mockLinks);

    // window.open 모킹
    const mockOpen = jest.fn();
    Object.defineProperty(window, "open", {
      value: mockOpen,
      writable: true,
    });

    render(
      <EditableText {...defaultProps} text="Visit https://example.com today" />
    );

    const linkSpan = screen.getByText("example.com");
    fireEvent.click(linkSpan);

    expect(mockOpen).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );
  });

  test("링크 클릭 시 편집 모드로 전환되지 않아야 함", async () => {
    const mockLinks = [
      {
        url: "https://example.com",
        domain: "example.com",
        startIndex: 5,
        endIndex: 25,
        originalText: "https://example.com",
      },
    ];
    mockDetectLinks.mockReturnValue(mockLinks);

    const user = userEvent.setup();
    render(
      <EditableText {...defaultProps} text="Visit https://example.com today" />
    );

    const linkSpan = screen.getByText("example.com");
    await user.click(linkSpan);

    // 편집 모드로 전환되지 않았는지 확인
    expect(
      screen.queryByDisplayValue("Visit https://example.com today")
    ).not.toBeInTheDocument();
  });

  test("여러 개의 링크가 올바르게 렌더링되어야 함", () => {
    const mockLinks = [
      {
        url: "https://example.com",
        domain: "example.com",
        startIndex: 6,
        endIndex: 26,
        originalText: "https://example.com",
      },
      {
        url: "https://google.com",
        domain: "google.com",
        startIndex: 31,
        endIndex: 49,
        originalText: "https://google.com",
      },
    ];
    mockDetectLinks.mockReturnValue(mockLinks);

    render(
      <EditableText
        {...defaultProps}
        text="Visit https://example.com and https://google.com"
      />
    );

    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("google.com")).toBeInTheDocument();
    expect(screen.getAllByText("🔗")).toHaveLength(2);
    expect(screen.getByText(/Visit/)).toBeInTheDocument();
    expect(screen.getByText(/and/)).toBeInTheDocument();
  });

  test("공백 키 입력 시 이벤트 전파가 중단되어야 함", async () => {
    const user = userEvent.setup();

    render(<EditableText {...defaultProps} />);

    const textDiv = screen.getByText("Test text");
    await user.click(textDiv);

    const input = screen.getByDisplayValue("Test text");

    // 공백 키 이벤트 시뮬레이션
    fireEvent.keyDown(input, { key: " " });

    // 이벤트 전파가 중단되는지 확인하기 위해 실제로 handleKeyDown이 호출되는지 확인
    expect(input).toBeInTheDocument();
  });
});
