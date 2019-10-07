import React, { Component, Fragment } from 'react';
import { sourceOptions, endpoint } from './config';
import styled from 'styled-components';
import Select from 'react-select';
import Icon from './Icon';
import theme from './theme';
import format from 'date-fns/format';
import Button from './Button';
import { Link } from 'react-router-dom';
import MagnetPlayer from './MagnetPlayer';
import Spinner from './Spinner';
import { updateWatchedEpisodes } from './lastWatchedService';

const ShowStyles = styled.main`
  .wrapper-top {
    max-width: 1024px;
    margin: 0 auto;
    padding: 8px;
    padding-bottom: 0;
    button {
      margin-left: 0;
    }
  }
  .wrapper {
    max-width: 1024px;
    margin: 0 auto;
    margin-bottom: 24px;
    padding: 0 8px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    @media (max-width: 786px) {
      flex-direction: column;
      main {
        margin: 0;
      }
    }
  }
  .mobile-cover {
    display: block;
    max-width: 240px;
    @media (min-width: 786px) {
      display: none;
    }
  }
  .back-btn {
    .material-icons {
      font-size: 16px;
      margin-right: 4px;
    }
    @media (max-width: 420px) {
      margin-left: 0;
      margin-bottom: 8px;
    }
  }
  aside {
    flex: 0 0 0%;
    img {
      min-width: 250px;
      display: block;
      margin-top: .5rem;
      border-radius: 4px;
    }
    @media (max-width: 786px) {
      order: 2;
      img {
        display: none;
      }
    }
    
  }
  main {
    flex: 1 1 0%;
    margin: 0 16px;
  }
  
  .meta {
    margin-bottom: 2rem;
    h2 {
      font-size: 2rem;
      font-weight: lighter;
      margin-top: .75rem;
      margin-bottom: 1rem;
    }
    p {
      line-height: 1.5;
      font-size: 18px;
      margin-top: .25rem;
    }
    small {
      font-size: 14px;
      font-weight: bold;
    }
  }
  .search-box {
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e4e4e4;
    display: inline-block;
    margin: 1.5rem 0;
    &:hover {
      border-color: #ccc;
    }
    & + p {
      margin: 0 2px;
      font-size: 14px;
      font-weight: bold;
    }
    input {
      font-size: 14px;
      line-height: 26px;
      padding: 2px 6px;
      outline: none;
      border: 2px solid transparent;
      background: transparent;
      min-width: 180px;
    }
    .material-icons {
      opacity: 0.5;
      padding-left: 6px;
    }
  }
  .select-box {
    min-width: 210px;
    display: inline-block;
    label {
      display: block;
      margin-bottom: 4px;
    }
  }
  .video-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: .5rem;
    margin-bottom: 2rem;
    .qualities {
      margin-right: .5rem;
      button {
        min-width: 60px;
      }
      button:first-child {
        margin-left: 0;
      }
    }
    > p {
      flex-grow: 1;
    }
    button {
      border-color: transparent;
      &:hover, &:focus {
        border-color: ${theme.colors.secondaryDark};
      }
    }
    @media (max-width: 420px) {
      flex-wrap: wrap;
      > a {
        margin-top: .5rem;
      }
    }
  }
`;

const List = styled.ul`
  list-style: none;
  margin-top: .5rem;
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;
  li {
    cursor: pointer;
    padding: 8px 10px;
    line-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    .material-icons {
      display: none;
      vertical-align: middle;
      font-size: 18px;
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
    &.selected {
      outline: 1px solid #ccc;
    }
  }
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

  awaitState(modifier) {
    return new Promise(resolve => this.setState(modifier, resolve));
  }

  componentDidMount() {
    this.fetchShow().then(() => {
      const eps = this.state.show.episodes;
      if (!this.state.selectedEpisode && eps.length > 0) {
        const epNumber = this.getEpisodeFromProps(this.props) || eps[0].episodeNumber;
        this.findEpisode(epNumber);
      }
    });
  }

  componentDidUpdate(prevProps) {
    const prevEp = this.getEpisodeFromProps(prevProps);
    const currEp = this.getEpisodeFromProps(this.props);
    const {loadingShow, loadingEpisodes} = this.state;
    if (prevEp !== currEp && !loadingShow && !loadingEpisodes) {
      this.findEpisode(currEp);
    }
  }

  getEpisodeFromProps({location}) {
    const qs = location.search.replace('?', '');
    const urlParams = new URLSearchParams(qs);
    return Number(urlParams.get('ep'));
  }

  handleSearch = (ev) => {
    this.setState({search: ev.target.value})
  }

  handleKeyUp = (ev) => {
    if (ev.which === 13) {
      this.doSearch();
    }
  }

  doSearch(search) {
    this.awaitState(state => ({
      ...state,
      page: 0,
      search: search || state.search,
      loadingEpisodes: true,
      show: {
        ...state.show,
        episodes: []
      }
    }))
    .then(() => this.fetchShow())
    .then(() => {
      const epList = this.state.show.episodes; 
      const ep = epList.find(ep => ep.episodeNumber === Number(this.state.search)) || epList[0];
      this.selectEpisode(ep);
    });
  }

  handleNextPage = () => {
    this.setState(
      ({page, search}) => ({
        search: '',
        loadingEpisodes: true,
        page: search ? 0 : page + 1
      }), () => {
        this.fetchShow();
      }
    )
  }

  findEpisode(epNumber) {
    const foundEp = this.state.show.episodes.find(ep => ep.episodeNumber === epNumber);
    if (foundEp) {
      this.selectEpisode(foundEp);
    } else {
      const searchStr = epNumber < 10 ? `0${epNumber}` : epNumber;
      this.doSearch(searchStr);
    }
  }

  selectEpisode(ep) {
    if (!ep) {
      return;
    }
    Object.keys(ep.qualities).forEach(key => {
      ep.qualities[key].key = key;
    });
    ep.qualitiesMap = ep.qualities;
    ep.qualitiesFlat = Object.values(ep.qualities).filter(Boolean)
      .sort((a, b) => parseInt(a.key) - parseInt(b.key));
    const torrent = ep.qualitiesMap['720p'] || ep.qualitiesMap['480p'] || ep.qualities[0];
    
    this.setState({
      selectedEpisode: ep,
      selectedTorrent: torrent
    });
  }

  async fetchShow() {
    const slug = this.props.match.params.slug;
    const {page, source} = this.state;
    const meta = page === 0 && !this.state.search ? '1' : '';

    const search = this.state.search ? ' ' + this.state.search : '';
    const url = `${endpoint}/show/${slug}${search}?page=${page}&meta=${meta}&source=${source.value}`;
    const res = await window.fetch(url);
    if (res.status === 404) {
      this.props.history.replace('/not-found');
    }
    const json = await res.json();
    json.episodes.sort((a, b) => b.episodeNumber - a.episodeNumber);
    return this.awaitState(state => {
      const prevEps = state.show ? state.show.episodes : [];
      const pageHasNext = json.episodes.length > 0;
      const episodes = prevEps.concat(json.episodes)
        .sort((a, b) => (
          a.episodeNumber - b.episodeNumber
        ));
      return {
        ...state,
        loadingShow: false,
        loadingEpisodes: false,
        pageHasNext,
        loading: false,
        show: {
          ...state.show,
          ...json,
          posterImage: (state.show && state.show.posterImage) || (json.posterImage && json.posterImage.small),
          episodes
        }
      }
    });
  }

  goToEpisode(ep) {
    const url = this.props.location.pathname;
    this.props.history.push(`${url}?ep=${ep.episodeNumber}`);
  }

  getNextEpisode() {
    const {show, selectedEpisode} = this.state;
    return selectedEpisode && show.episodes.find(
      ep => ep.episodeNumber === selectedEpisode.episodeNumber + 1
    );
  }

  episodeIsSelected(episode) {
    return this.state.selectedEpisode 
      && this.state.selectedEpisode.episodeNumber === episode.episodeNumber;
  }

  formatEpisodeTitle(episode) {
    const date = format(new Date(episode.timestamp), 'DD/MM/YYYY');
    return <p>Ep. {episode.episodeNumber} - {date}</p>
  }

  updateLastWatched() {
    const {posterImage, canonicalTitle} = this.state.show;
    const epNumber = this.state.selectedEpisode.episodeNumber;
    const slug = this.props.match.params.slug;
    const data = {
      epNumber,
      img: posterImage,
      title: canonicalTitle,
      id: slug
    };
    updateWatchedEpisodes(data);
  }

  render() {
    const {
      loadingShow, loadingEpisodes,
      show, source, pageHasNext, search,
      selectedEpisode, selectedTorrent
    } = this.state;
    const statusMap = {
      finished: 'Finalizada',
      current: 'En emisión'
    }
    if (loadingShow) {
      return <Spinner />
    }
    const nextEpisode = this.getNextEpisode();
    const url = this.props.location.pathname;
    return (
      <ShowStyles>
        <div className="wrapper-top">
          <Link to="/">
            <Button main className="back-btn">
              <i className="material-icons">arrow_back</i>
              <span>Volver</span>
            </Button>
          </Link>
          <img className="mobile-cover" src={show.posterImage} alt="portada del show" />
        </div>        
        <div className="wrapper">
          <aside>
            <img src={show.posterImage} alt="portada del show" />
            <div className="search-box" 
              title="Escribe un numero y pulsa enter ⏎">
              <Icon icon="search" />
              <input
                type="number"
                ref={node => this.inputNode = node}
                value={search}
                onChange={this.handleSearch}
                onKeyUp={this.handleKeyUp}
                placeholder="Buscar ep. por numero" />
            </div>
            <p>Episodios</p>
            <List>
              {show.episodes.map(ep => (
                <li tabIndex={0} key={ep.episodeNumber}
                  className={this.episodeIsSelected(ep) ? 'selected' : ''}
                  onClick={() => this.goToEpisode(ep)}>
                  {this.formatEpisodeTitle(ep)}
                  {this.episodeIsSelected(ep) && (
                    <i className="material-icons">play_arrow</i>
                  )}
                </li>
              ))}
            </List>
            {pageHasNext && (
              <Button main
                disabled={loadingEpisodes} 
                onClick={this.handleNextPage}>
                Cargar más
              </Button>
            )}
          </aside>
          <main>
            <section className="meta">
              <h2>{show.canonicalTitle}</h2>
              <small>
                {new Date(show.startDate).getFullYear()}
                {' - '}
                {statusMap[show.status]}
              </small>
              <p>{show.description}</p>
            </section>
            {selectedEpisode && (
              <Fragment>
                <MagnetPlayer
                  magnet={selectedTorrent.magnet}
                  onLoaded={() => this.updateLastWatched()} />
                <section className="video-toolbar">
                  <div className="qualities">
                    {selectedEpisode.qualitiesFlat.map(torrent => (
                      <Button key={torrent.key} 
                        main={torrent.key === selectedTorrent.key}
                        onClick={() => this.setState({selectedTorrent: selectedEpisode.qualitiesMap[torrent.key]})}>
                        {torrent.key}
                      </Button>
                    ))}
                  </div>
                  <p>Ep. {selectedEpisode.episodeNumber}</p>
                  {nextEpisode && (
                    <Link to={`${url}?ep=${nextEpisode.episodeNumber}`}>
                      <Button main>Siguiente episodio</Button>
                    </Link>
                  )}
                </section>
                <div className="select-box">
                  <label htmlFor="sort">Fuente</label>
                  <Select
                    isSearchable={false}
                    value={source}
                    options={sourceOptions}
                    onChange={this.handleSourceChange}
                  />
                </div>
              </Fragment>
            )}
          </main>
        </div>
      </ShowStyles>
    );
  }
}

export default Show;
