import React, { Component } from 'react';
import { sourceOptions, endpoint } from './config';
import styled from 'styled-components';
import Select from 'react-select';
import Icon from './Icon';
import theme from './theme';
import format from 'date-fns/format';

const ShowStyles = styled.main`
  overflow-y: auto;
  max-height: calc(100vh - 60px);
  .wrapper {
    max-width: 1024px;
    margin: 0 auto;
    margin-bottom: 24px;
    margin-top: 16px;
    padding: 0 8px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }
  aside {
    img {
      display: block;
      margin: 0 auto;
      margin-bottom: 16px;
    }
  }
  main {
    flex: 1 1 0%;
    margin: 0 16px;
  }
  
  .meta {
    h2 {
      margin-top: 6px;
      font-weight: 400;
    }
    p {
      margin: 16px 0;
    }
  }
  .search-box {
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e4e4e4;
    display: inline-block;
    input {
      font-size: 14px;
      line-height: 26px;
      padding: 2px 6px;
      outline: none;
      border: 2px solid transparent;
      background: transparent;
      min-width: 200px;
    }
    .material-icons {
      opacity: 0.5;
      padding-left: 6px;
    }
  }
  .select-box {
    min-width: 210px;
    display: inline-block;
    margin-top: 8px;
    label {
      display: block;
      margin-bottom: 4px;
    }
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 16px 0;
  max-height: 300px;
  overflow-y: auto;
  li {
    cursor: pointer;
    padding: 8px 10px;
    line-height: 28px;
    display: flex;
    align-items: center;
    background: white;
    .material-icons {
      display: none;
      vertical-align: middle;
      font-size: 18px;
      margin-right: 8px;
      padding: 4px;
      border-radius: 15px;
      border: 1px solid currentColor;
    }
    &:hover, &:focus, &.selected {
      background: ${theme.colors.secondaryDim};
      .material-icons {
        display: inline-block;
      }
    }
  }
`;

const Loading = styled.p`
  text-align: center;
  font-size: 24px;
  margin-top: 16px;
`;

class Show extends Component {

  inputNode = null
  state = {
    search: '',
    loadingShow: true,
    loadingEpisodes: false,
    show: null,
    source: sourceOptions[0],
    page: 0,
    pageHasNext: true,
    selectedEpisode: null,
    selectedTorrent: null
  }

  componentDidMount() {
    this.fetchShow();
  }

  handleSearch = (ev) => {
    this.setState({search: ev.target.value})
  }

  handleKeyUp = (ev) => {
    if (ev.which === 13) {
      this.setState(state => ({
        ...state,
        show: {
          ...state.show,
          episodes: []
        }
      }), () => {
        this.fetchShow();
      });
    }
  }

  async fetchShow() {
    const slug = this.props.match.params.slug;
    const {page, source} = this.state;
    const meta = Number(page === 0);

    const search = this.state.search ? ' ' + this.state.search : '';
    const url = `${endpoint}/show/${slug}${search}?page=${page}&meta=${meta}&source=${source.value}`;
    const res = await window.fetch(url);
    const json = await res.json();
    json.episodes.sort((a, b) => b.episodeNumber - a.episodeNumber);
    this.setState(state => {
      const prevEps = state.show ? state.show.episodes : [];
      return {
        ...state,
        loadingShow: false,
        loadingEpisodes: false,
        pageHasNext: json.episodes.length > 0,
        loading: false,
        show: {
          ...state.show,
          ...json,
          episodes: prevEps.concat(json.episodes)
        }
      }
    })
  }
  
  getEpNumber({location}) {
    const params = new URLSearchParams(location.search.replace('?', ''));
    const epString = params.get('ep');
    return Number(epString);
  }

  selectEpisode() {}

  episodeIsSelected(episode) {
    return this.state.selectedEpisode 
      && this.state.selectedEpisode.episodeNumber === episode.episodeNumber;
  }

  formatEpisodeTitle(episode) {
    const date = format(new Date(episode.timestamp), 'DD/MM/YYYY');
    return `${date} - ${episode.showTitle} - ${episode.episodeNumber} `;
  }

  render() {
    const {
      loadingShow, loadingEpisodes,
      show, source, pageHasNext, search
    } = this.state;
    if (loadingShow) {
      return <Loading>Cargando...</Loading>
    }
    return (
      <ShowStyles>
        <div className="wrapper">
          <aside>
            <img src={show.posterImage.small} alt="portada del show" />
            <div className="search-box">
              <Icon icon="search" />
              <input
                type="number"
                ref={node => this.inputNode = node}
                value={search}
                onChange={this.handleSearch}
                onKeyUp={this.handleKeyUp}
                placeholder="Buscar ep. por numero" />
            </div>
            <List>
              {show.episodes.map(ep => (
                <li tabIndex={0} key={ep.episodeNumber}
                  className={this.episodeIsSelected(ep) ? 'selected' : ''}
                  onClick={() => this.selectEpisode(ep)}>
                  <i className="material-icons">play_arrow</i>
                  <p>{this.formatEpisodeTitle(ep)}</p>
                </li>
              ))}
            </List>
          </aside>
          <main>
            <div className="meta">
              <h2>{show.canonicalTitle}</h2>
              <p>{show.description}</p>
            </div>
            <div className="select-box">
              <label htmlFor="sort">Fuente</label>
              <Select
                isSearchable={false}
                value={source}
                options={sourceOptions}
                onChange={this.handleSourceChange}
              />
            </div>
          </main>
        </div>
      </ShowStyles>
    );
  }
}

export default Show;
