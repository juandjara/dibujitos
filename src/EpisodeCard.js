import React from 'react'
import theme from './theme'
import styled from 'styled-components'
import Icon from './Icon'
import format from 'date-fns/format'
import { Link } from 'react-router-dom'

function formatDate(ms) {
  const date = new Date(ms);
  return format(date, 'DD/MM - HH:mm');
}

const EpisodeCardStyles = styled.li`
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 240px;

  &:hover, &:focus {
    box-shadow: 0 0 6px 1px ${theme.colors.secondary};
  }

  .info {
    padding: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    background: rgba(255,255,255, 0.9);
    width: 100%;
    border-radius: 0 0 4px 4px;

    p {
      margin: 5px 0;
    }

    .title {
      display: flex;
      a {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        flex: 1;
      }
    }

    .date {
      .material-icons {
        margin-right: 6px;
      }
    }
  }

  .img-wrapper {
    height: 100%;

    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: cover;
    }
  }

  .close-btn {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2px;
    background: rgba(255,255,255, 1);
    opacity: 0.66;
    border: none;
    cursor: pointer;
    border-bottom-left-radius: 4px;

    .material-icons {
      font-size: 14px;
    }

    &:hover {
      opacity: 1;
      .material-icons {
        color: red;
      }
    }
  }
`;

export default function EpisodeCard ({ image, link, title, number, date, onClose }) {
  return (
    <EpisodeCardStyles className="episode-card">
      <div className="img-wrapper">
        <img src={image} alt="portada del show" />
      </div>
      <div className="info">
        <p className="title">
          <Link to={link}>{title}</Link>
          <span>Ep. {number}</span>
        </p>
        {date && (<p className="date">
          <i className="material-icons">event</i>
          <span>{formatDate(date)}</span>
        </p>)}
      </div>
      {onClose && (
        <button onClick={onClose} className="close-btn">
          <Icon icon="close" />
        </button>
      )}
    </EpisodeCardStyles>
  )
}
