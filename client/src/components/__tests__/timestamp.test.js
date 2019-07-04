import React from 'react';
import { render, cleanup } from '@testing-library/react'
import Timestamp from '../timestamp.react';
import moment from 'moment';
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('timestamp titles render properly', () => {
  const sometime = new Date('2018-08-15')
  const formattedSometime = moment.utc(sometime).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
  const { container, getByText } = render(<Timestamp dataTime={ sometime }/>)
  const timestamp = container.firstChild

  const timestampTitles = timestamp.firstChild;
  expect(timestampTitles).toMatchSnapshot()
});

it('timestamp times render properly', () => {
  const sometime = new Date('2018-08-15')
  const formattedSometime = moment.utc(sometime).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
  const { container, getByText } = render(<Timestamp dataTime={ sometime }/>)
  const timestamp = container.firstChild
  expect(getByText(moment.utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]'))).toBeInTheDocument()
  expect(getByText(formattedSometime)).toBeInTheDocument()
})
