import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

test('renders Kolab app root', () => {
  render(<App />)
  expect(screen.getByText(/Kolab/i)).toBeInTheDocument()
})
