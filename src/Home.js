import React from 'react';
import styled from 'styled-components';
import Latest from './Latest';
import Calendar from './Calendar';

const HomeStyles = styled.main`
  @media (min-width: 920px) {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .column {
      overflow-y: auto;
      max-height: calc(100vh - 60px);
    }
  }
`;

function Home({location}) {
  const qs = location.search.replace('?', '');
  const urlParams = new URLSearchParams(qs);
  const search = urlParams.get('search') || '';
  return (
    <HomeStyles>
      <Latest search={search} />
      <Calendar />
    </HomeStyles>
  );
}

export default Home;
