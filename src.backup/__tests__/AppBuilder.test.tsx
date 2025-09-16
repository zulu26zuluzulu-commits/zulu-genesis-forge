import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppBuilder from '@/components/AppBuilder';

test('AppBuilder renders', () => {
	render(<MemoryRouter><AppBuilder /></MemoryRouter>);
	const el = screen.getByRole('main');
	expect(el).toBeInTheDocument();
});
