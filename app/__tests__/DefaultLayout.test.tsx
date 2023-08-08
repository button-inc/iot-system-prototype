import React from "react";
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { axe, toHaveNoViolations } from 'jest-axe';

import DefaultLayout from "../components/Layout";

expect.extend(toHaveNoViolations);

describe('DefaultLayout', function () {
    it('Should have no accessibility violations', async () => {

       const { container } = render(<DefaultLayout />)
       const results = await axe(container);
 
       expect(results).toHaveNoViolations();
    })
 
 });
