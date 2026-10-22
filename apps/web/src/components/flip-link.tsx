"use client";

import type { CSSProperties } from "react";
import styled, { css } from "styled-components";
import Link from "next/link";

function renderLetters(label: string) {
  return label.split("").map((char, i) => (
    <span key={i} style={{ "--i": i + 1 } as CSSProperties}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export function FlipLink({ href, label }: { href: string; label: string }) {
  return (
    <StyledLink href={href} aria-label={label}>
      <span className="layer layer-out" aria-hidden="true">
        {renderLetters(label)}
      </span>
      <span className="layer layer-in" aria-hidden="true">
        {renderLetters(label)}
      </span>
    </StyledLink>
  );
}

export function FlipButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <StyledButton type="button" onClick={onClick} aria-label={label}>
      <span className="layer layer-out" aria-hidden="true">
        {renderLetters(label)}
      </span>
      <span className="layer layer-in" aria-hidden="true">
        {renderLetters(label)}
      </span>
    </StyledButton>
  );
}

export const Pill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem;
  border-radius: 9999px;
  background-color: rgba(20, 20, 25, 0.55);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
`;

const flipStyles = css`
 position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.7rem;
  line-height: 1.4;
  font-family: var(--font-dm-serif);
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;

  @media (min-width: 640px) {
    padding: 1rem 1.1rem;
    font-size: 0.95rem;
  }

  color: white;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;

  .layer {
    display: flex;
    overflow: hidden;
  }

  .layer-in {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .layer-out span,
  .layer-in span {
    transition: transform ease-in-out;
    transition-duration: calc(0.1s + var(--i) * 0.1s);
  }

  .layer-in span {
    transform: translateY(-100%);
  }

  &:hover .layer-out span {
    transform: translateY(100%);
  }

  &:hover .layer-in span {
    transform: translateY(0);
  }
`;

const StyledLink = styled(Link)`
  ${flipStyles}
`

const StyledButton = styled.button`
  ${flipStyles}
  background: none;
  border: 0;
`;