import React from 'react';
import styled from 'styled-components';
import Button from './Button';
import {Link} from 'react-router-dom';

const Container = styled.div`
  text-align: center;
  padding: 30px;
  h2 {
    font-weight: 400;
    margin-bottom: 24px;
  }
  small {
    color: red;
  }
  .material-icons {
    font-size: 16px;
    margin-right: 4px;
  }
`;

const NotFound = () => (
  <Container>
    <h2>Aqui no hay nada ¯\_(ツ)_/¯</h2>
    <Link to="/">
      <Button main>
        <i className="material-icons">arrow_back</i>
        <span>Volver</span>
      </Button>
    </Link>
  </Container>
)
export default NotFound;