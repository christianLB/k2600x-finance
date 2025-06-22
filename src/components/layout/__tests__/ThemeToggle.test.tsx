/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '@k2600x/design-system';

jest.mock('@k2600x/design-system', () => ({
  Button: (props: any) => <button {...props}>{props.children}</button>,
  Icon: () => null,
  useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
  test('cycles from dark to futuristic', () => {
    const setTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', setTheme });

    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));

    expect(setTheme).toHaveBeenCalledWith('futuristic');
  });
});
