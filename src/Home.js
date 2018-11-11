import React from 'react';
import styled from 'styled-components';
import Latest from './Latest';
import Calendar from './Calendar';

const HomeStyles = styled.main`
  @media (min-width: 600px) {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .column {
      overflow-y: auto;
      max-height: calc(100vh - 60px);
      &.grow {
        flex-grow: 1;
      }
    }
  }
`;

function Home() {
  return (
    <HomeStyles>
      <Latest />
      <Calendar />
    </HomeStyles>
  );
}

export default Home;
