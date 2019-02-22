import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import SearchBox from './SearchBox';
import Icon from './Icon';
import { endpoint } from './config';
import useLocalStorage from './useLocalStorage';
import Spinner from './Spinner';

const STORAGE_KEY = 'dibujitos_recent_searches';

function RawSearch(props) {
  const inputRef = useRef(null);
  const [search, setSearch] = useState(props.search);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useLocalStorage(STORAGE_KEY, []);
  const canShowRecent = !loading && recentSearches.length > 0 && results.length === 0;

  function handleKeyUp(ev) {
    if (ev.which !== 13) {
      return;
    }
    inputRef.current.blur();
    const search = inputRef.current.value;
    triggerSearchRequest(search);
    setRecentSearches(recentSearches.concat(search));
  }

  function deleteRecent(search) {
    const newSearches = recentSearches.filter(s => s !== search);
    setRecentSearches(newSearches);
  }

  function triggerSearchRequest(search) {
    setLoading(true);
    setSearch(search)
  }

  async function fetchResults() {
    if (!search) {
      setLoading(false);
      setResults([]);
      return;
    }
    const res  = await fetch(`${endpoint}/rawsearch?q=${search}`);
    const json = await res.json();
    setLoading(false);
    setResults(json);
  }

  useEffect(() => {
    fetchResults();
  }, [search])

  return (
    <SearchStyles>
      <h2>Busqueda directa</h2>
      <SearchBox background="white" color="#333" placeholderColor="#666">
        <input
          type="search"
          ref={inputRef}
          defaultValue={search}
          onKeyUp={handleKeyUp}
          placeholder="Buscar directamente en nyaa.si" />
        <Icon icon="search" />
      </SearchBox>
      {loading && <Spinner />}
      {canShowRecent && 
        <RecentSearches 
          onClick={triggerSearchRequest}
          onDelete={deleteRecent} 
          searches={recentSearches} />}
      <ul>
        {results.map(item => (
          <li key={item.links.page}>
            <a href={item.links.magnet}>{item.name}</a>
          </li>
        ))}
      </ul>
    </SearchStyles>
  )
}

function RecentSearches({onClick, onDelete, searches}) {
  return <RecentSearchesStyle>
    <p>Busquedas recientes:</p>
    <ul>
      {searches.map(item => (
        <li onClick={() => onClick(item)}>
          <span>{item}</span>
          <Icon onClick={() => onDelete(item)} size="1em" icon="close" />
        </li>
      ))}
    </ul>
  </RecentSearchesStyle>
}

const RecentSearchesStyle = styled.div`
  margin: 24px 4px;
  ul {
    display: flex;
    margin: 8px 0;
    li {
      background-color: white;
      padding: 8px;
      margin-right: 12px;
      border-radius: 4px;
      border: 1px solid #d3d3d3;
      cursor: pointer;
    }
    .material-icons {
      margin-left: 4px;
    }
  }
`;

const SearchStyles = styled.div`
  max-width: 768px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 0;
  h2 {
    font-size: 2em;
    font-weight: normal;
    text-align: center;
    margin-bottom: 1em;
  }
  ${SearchBox} {
    align-items: center;
    display: flex;
    input {
      flex-grow: 1;
    }
  }
  > ul {
    margin-top: 12px;
    li {
      padding: 8px 0;
    }
  }
`;

export default RawSearch