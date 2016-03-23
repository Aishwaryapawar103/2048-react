'use strict';

var BoardView = React.createClass({
  displayName: 'BoardView',

  getInitialState: function getInitialState() {
    return { board: new Board() };
  },
  restartGame: function restartGame() {
    this.setState(this.getInitialState());
  },
  handleKeyDown: function handleKeyDown(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      event.preventDefault();
      var direction = event.keyCode - 37;
      this.setState({ board: this.state.board.move(direction) });
    }
  },
  handleTouchStart: function handleTouchStart(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.touches.length != 1) {
      return;
    }
    this.startX = event.touches[0].screenX;
    this.startY = event.touches[0].screenY;
    event.preventDefault();
  },
  handleTouchEnd: function handleTouchEnd(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.changedTouches.length != 1) {
      return;
    }
    var deltaX = event.changedTouches[0].screenX - this.startX;
    var deltaY = event.changedTouches[0].screenY - this.startY;
    var direction = -1;
    if (Math.abs(deltaX) > 3 * Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      direction = deltaX > 0 ? 2 : 0;
    } else if (Math.abs(deltaY) > 3 * Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      direction = deltaY > 0 ? 3 : 1;
    }
    if (direction != -1) {
      this.setState({ board: this.state.board.move(direction) });
    }
  },
  componentDidMount: function componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  render: function render() {
    var cells = this.state.board.cells.map(function (row) {
      return React.createElement(
        'div',
        null,
        row.map(function () {
          return React.createElement(Cell, null);
        })
      );
    });
    var tiles = this.state.board.tiles.filter(function (tile) {
      return tile.value != 0;
    }).map(function (tile) {
      return React.createElement(TileView, { tile: tile });
    });
    return React.createElement(
      'div',
      { className: 'board', onTouchStart: this.handleTouchStart, onTouchEnd: this.handleTouchEnd, tabIndex: '1' },
      cells,
      tiles,
      React.createElement(GameEndOverlay, { board: this.state.board, onRestart: this.restartGame })
    );
  }
});

var Cell = React.createClass({
  displayName: 'Cell',

  shouldComponentUpdate: function shouldComponentUpdate() {
    return false;
  },
  render: function render() {
    return React.createElement(
      'span',
      { className: 'cell' },
      ''
    );
  }
});

var TileView = React.createClass({
  displayName: 'TileView',

  shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
    if (this.props.tile != nextProps.tile) {
      return true;
    }
    if (!nextProps.tile.hasMoved() && !nextProps.tile.isNew()) {
      return false;
    }
    return true;
  },
  render: function render() {
    var tile = this.props.tile;
    var classArray = ['tile'];
    classArray.push('tile' + this.props.tile.value);
    if (!tile.mergedInto) {
      classArray.push('position_' + tile.row + '_' + tile.column);
    }
    if (tile.mergedInto) {
      classArray.push('merged');
    }
    if (tile.isNew()) {
      classArray.push('new');
    }
    if (tile.hasMoved()) {
      classArray.push('row_from_' + tile.fromRow() + '_to_' + tile.toRow());
      classArray.push('column_from_' + tile.fromColumn() + '_to_' + tile.toColumn());
      classArray.push('isMoving');
    }
    var classes = React.addons.classSet.apply(null, classArray);
    return React.createElement(
      'span',
      { className: classes, key: tile.id },
      tile.value
    );
  }
});

var GameEndOverlay = React.createClass({
  displayName: 'GameEndOverlay',

  render: function render() {
    var board = this.props.board;
    var contents = '';
    if (board.hasWon()) {
      contents = 'Good Job!';
    } else if (board.hasLost()) {
      contents = 'Game Over';
    }
    if (!contents) {
      return null;
    }
    return React.createElement(
      'div',
      { className: 'overlay' },
      React.createElement(
        'p',
        { className: 'message' },
        contents
      ),
      React.createElement(
        'button',
        { className: 'tryAgain', onClick: this.props.onRestart, onTouchEnd: this.props.onRestart },
        'Try again'
      )
    );
  }
});

React.initializeTouchEvents(true);
React.renderComponent(React.createElement(BoardView, null), document.getElementById('boardDiv'));