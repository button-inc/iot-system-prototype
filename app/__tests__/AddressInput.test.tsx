import React from "react";
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { axe, toHaveNoViolations } from 'jest-axe';

import AddressInput from "../components/AddressInput";

expect.extend(toHaveNoViolations);

describe('AddressInput', function () {
   it('Should have no accessibility violations', async () => {
      const addPoint = jest.fn();
      const removePoint = jest.fn();
      const { container } = render(<AddressInput id={ '1' } addPoint={ addPoint } removePoint={ removePoint } />)
      const results = await axe(container);

      expect(results).toHaveNoViolations();
   });

   it('should display', function () {
      const addPoint = jest.fn();
      const removePoint = jest.fn();
      const { container } = render(<AddressInput id={ '1' } addPoint={ addPoint } removePoint={ removePoint } />)
      const header = container.getElementsByClassName("address-input-wrapper");
      expect(header).toBeInTheDocument;
   });
});

