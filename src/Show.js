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

const ShowStyles = styled.main`
  overflow-y: auto;
  max-height: calc(100vh - 60px);
  .wrapper {
    max-width: 1024px;
    margin: 0 auto;
    margin-bottom: 24px;
    margin-top: 6px;
    padding: 0 8px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    @media (max-width: 786px) {
      flex-direction: column;
      aside {
        margin-top: 24px;
      }
      main {
        margin: 0;
        h2 {
          text-align: center;
        }
      }
    }
  }
  .mobile-cover {
    display: block;
    margin: 0 auto;
    max-width: 240px;
    @media (min-width: 786px) {
      display: none;
    }
  }
  aside {
    flex: 0 0 0%;
    img {
      display: block;
      margin-top: 6px;
      margin-left: 2px;
      margin-bottom: 16px;
    }
    @media (max-width: 786px) {
      order: 2;
      img {
        display: none;
      }
    }
    .material-icons {
      font-size: 16px;
      margin-right: 4px;
    }
  }
  main {
    flex: 1 1 0%;
    margin: 0 16px;
  }
  
  .meta {
    margin-top: 60px;
    h2 {
      margin-top: 6px;
      margin-bottom: 16px;
      font-weight: 400;
    }
    p + p {
      margin-top: 4px;
      margin-bottom: 16px;
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
    margin-bottom: 12px;
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
  .video-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
    button {
      border-color: transparent;
      &:hover, &:focus {
        border-color: ${theme.colors.secondaryDark};
      }
    }
  }
`;

const List = styled.ul`
  list-style: none;
  margin-top: 8px;
  margin-bottom: 12px;
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
      ({page}) => ({
        loadingEpisodes: true,
        page: page + 1
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
    const firsTorrentKey = Object.keys(ep.qualities)
      .find(key => ep.qualities[key]);
    const torrent = ep.qualities['720p'] || ep.qualities['480p'] || ep.qualities[firsTorrentKey];
    
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
    const json = await res.json();
    json.episodes.sort((a, b) => b.episodeNumber - a.episodeNumber);
    return this.awaitState(state => {
      const prevEps = state.show ? state.show.episodes : [];
      const pageHasNext = json.episodes.length > 0;
      return {
        ...state,
        loadingShow: false,
        loadingEpisodes: false,
        pageHasNext,
        loading: false,
        show: {
          ...state.show,
          ...json,
          episodes: prevEps.concat(json.episodes)
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
    return (<div>
      <p>{episode.episodeNumber} - {date}</p>
      <p>{episode.showTitle}</p>
    </div>);
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
      return <Loading>Cargando...</Loading>
    }
    const nextEpisode = this.getNextEpisode();
    const url = this.props.location.pathname;
    return (
      <ShowStyles>
        <div className="wrapper">
          <img className="mobile-cover" src={show.posterImage.small} alt="portada del show" />
          <aside>
            <Button main className="back-btn" 
              onClick={() => window.history.back()}>
              <i className="material-icons">arrow_back</i>
              <span>Volver</span>
            </Button>
            <img src={show.posterImage.small} alt="portada del show" />
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
            <p style={{margin: '0 4px'}}>Episodios</p>
            <List>
              {show.episodes.map(ep => (
                <li tabIndex={0} key={ep.episodeNumber}
                  className={this.episodeIsSelected(ep) ? 'selected' : ''}
                  onClick={() => this.goToEpisode(ep)}>
                  <i className="material-icons">play_arrow</i>
                  {this.formatEpisodeTitle(ep)}
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
              <p>
                <small>
                  {new Date(show.startDate).getFullYear()}
                  {' - '}
                  {statusMap[show.status]}
                </small>
              </p>
              <p>{show.description}</p>
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
            {selectedEpisode && (
              <Fragment>
                <section className="video-toolbar">
                  <div className="qualities">
                    {Object.keys(selectedEpisode.qualities).map(key => (
                      <Button key={key} 
                        main={key === selectedTorrent.key}
                        onClick={() => this.setState({selectedTorrent: selectedEpisode.qualities[key]})}>
                        {key}
                      </Button>
                    ))}
                  </div>
                  {nextEpisode && (
                    <Link to={`${url}?ep=${nextEpisode.episodeNumber}`}>
                      <Button main>Siguiente episodio</Button>
                    </Link>
                  )}
                </section>
                <MagnetPlayer magnet={selectedTorrent.magnet} />
              </Fragment>
            )}
          </main>
        </div>
      </ShowStyles>
    );
  }
}

export default Show;
