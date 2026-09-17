"use client";

import styled from "styled-components";
import Link from "next/link";

export function RevealButton({ href, label }: { href: string; label: string }) {
  return (
    <StyledButton href={href}>
      <span className="label">{label}</span>
    </StyledButton>
  );
}

const StyledButton = styled(Link)`
  margin-top: 3.5rem;
  position: relative;
  overflow: hidden;
  padding: 15px 30px;
  border: none;
  border-radius: 15px;
  font-family: var(--font-dm-serif);
  color: #fefefe;
  font-weight: 700;
  font-size: 17px;
  background-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    border-radius: 15px;
    background-color: #212121;
    z-index: -1;
    transition: width 250ms;
  }

  &:hover::before {
    width: 100%;
  }

  .label {
    position: relative;
  }
`;
