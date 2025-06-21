/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { DynamicForm, DynamicField } from '../components/DynamicForm';
import { z } from 'zod';

jest.mock('@k2600x/design-system', () => {
  const React = require('react');
  return {
    Input: React.forwardRef((props: any, ref) => <input ref={ref} {...props} />),
    Button: (props: any) => <button {...props}>{props.children}</button>,
    Select: (props: any) => <select {...props}>{props.children}</select>,
    SelectTrigger: (props: any) => <div {...props}>{props.children}</div>,
    SelectContent: (props: any) => <div {...props}>{props.children}</div>,
    SelectItem: (props: any) => <option value={props.value}>{props.children}</option>,
    Label: (props: any) => <label {...props}>{props.children}</label>,
  };
});

describe('DynamicForm', () => {
  const fields: DynamicField[] = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Name' },
    { name: 'age', label: 'Age', type: 'number', placeholder: 'Age' },
  ];
  const schema = z.object({
    name: z.string().min(1),
    age: z.coerce.number().min(0),
  });

  test('submits valid data', async () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByRole } = render(
      <DynamicForm schema={schema} fields={fields} defaultValues={{}} onSubmit={onSubmit} />
    );

    fireEvent.change(getByLabelText('Name'), { target: { value: 'John' } });
    fireEvent.change(getByLabelText('Age'), { target: { value: '30' } });

    fireEvent.click(getByRole('button'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'John', age: 30 }));
  });

  test('shows validation error', async () => {
    const { getByRole, findByText } = render(
      <DynamicForm schema={schema} fields={fields} defaultValues={{}} onSubmit={jest.fn()} />
    );

    fireEvent.click(getByRole('button'));

    expect(await findByText(/name/i)).toBeTruthy();
  });
});
