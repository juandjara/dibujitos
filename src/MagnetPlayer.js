import React, {Component} from 'react';
import { BigPlayButton, Player } from 'video-react';
import 'video-react/dist/video-react.css';
import { downloaderApi } from './config';
import popcornService from './popcornService';
import Button from './Button';
import Icon from './Icon';
import styled from 'styled-components';
// import { updateWatchedEpisodes } from './lastWatchedService';

// TODO: make this a npm package

const VideoStyles = styled.div`
  .video-react {
    margin: 1em 0;
    .play-btn {
      border: none !important;
      background: none !important;
    }
    .play-btn:before {
      font-size: 4rem;
      text-shadow: 0 0 5px #333;
    }
  }
  .dl-link {
    margin-top: 12px;
  }
`;

const VideoPlaceholder = styled.div`
  margin: 1em 0;
  background: #111;
  position: relative;
  height: 0;
  padding-top: 56.25%;
  position: relative;
  .play-btn {
    border: none;
    background: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .material-icons {
    color: white;
    font-size: 4rem;
    text-shadow: 0 0 5px #333;
  }
`;

const Loader = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 12px 24px;
  .title {
    color: white;
    text-align: center;
    margin: 12px 8px;
  }
  .progress {
    border-radius: 2px;
    padding: 2px 4px;
    text-align: right;
    background: linear-gradient(
      to right,
      #2fae39 0%,
      #eee ${props => props.percent}%
    );
  }
`;

class MagnetPlayer extends Component {
  state = {
    loadingPercent: 0,
    loading: false,
    videoUrl: null,
    videoMime: null
  }

  componentDidMount() {
    popcornService.init(downloaderApi)    
  }

  componentWillUnmount() {
    popcornService.disconnect();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.magnet !== this.props.magnet) {
      this.setState({videoUrl: null})
    }
  }

  selectBiggestFile(files) {
    return files.reduce((prev, next) => {
      return next.length > prev.length ? next : prev;
    });
  }

  loadVideo() {
    const magnet = this.props.magnet;
    this.setState({loading: true});
    popcornService.loadMagnet(magnet, 'finished').then(files => {
      const biggestFile = this.selectBiggestFile(files);
      this.setState({
        loading: false,
        videoMime: biggestFile.mime === 'video/x-matroska' ? 'video/webm' : biggestFile.mime,
        videoUrl: `${downloaderApi}${biggestFile.link}`
      })
      // updateWatchedEpisodes(this.props.episodeData);
    }).catch(err => {
      this.setState({loading: false});
      console.error(err);
      window.alert('Algo ha fallado :c');
    })
    popcornService.addDownloadListener(progress => {
      const percent = progress.filter((n ,i) => i % 2 === 0)
        .reduce((acum, n) => acum + n, 0);
      this.setState({ loadingPercent: Number(percent).toFixed(2) })
    });
  }

  getFilenames() {
    if (!this.state.videoUrl) {
      return;
    }
    const urlParts = new URL(this.state.videoUrl);
    const fileName = decodeURIComponent(urlParts.pathname);
    return {
      video: fileName,
      subs: fileName.replace(/\.\w+$/, '.vtt')
    }
  }

  render() {
    const filenames = this.getFilenames();
    const {loading, loadingPercent, videoUrl, videoMime} = this.state;
    if (!videoUrl) {
      return (
        <VideoPlaceholder>
          {loading ? (
            <Loader percent={loadingPercent}>
              <p className="title">
                Descargando episodio al servidor de streaming. Por favor, espere.
              </p>
              <p className="progress">{loadingPercent}%</p>
            </Loader>
          ) : (
            <Button className="play-btn" onClick={() => this.loadVideo()}>
              <Icon icon="play_arrow" />
            </Button>
          )}
        </VideoPlaceholder>
      );
    }
    return (
      <VideoStyles>
        <Player autoPlay controls fluid 
          aspectRatio="16:9"
          crossOrigin="anonymous">
          <BigPlayButton className="play-btn" position="center" />
          <source src={this.state.videoUrl} type={videoMime} />
          <source src={`${this.state.videoUrl}?transform=remux`} type="video/webm" />
          <track
            default
            label="English"
            srcLang="en"
            kind="subtitles"
            src={`${this.state.videoUrl}?transform=subs`}
          />
        </Player>
        <p className="dl-link">
          <a download={filenames.video}
             href={this.state.videoUrl}>
            Descargar video
          </a>
        </p>
        <p className="dl-link">
          <a download={filenames.subs}
             href={`${this.state.videoUrl}?transform=subs`}>
            Descargar subtitulos
          </a>
        </p>
      </VideoStyles>
    )
  }
}

export default MagnetPlayer;
