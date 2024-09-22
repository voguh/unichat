import React from 'react'

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '~/App'

describe('App', () => {
  it('should app render', () => {
    const { getByText } = render(<App />)

    expect(getByText('Hello World!')).toBeInTheDocument()
  })
})
