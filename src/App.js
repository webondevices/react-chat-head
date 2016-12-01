import React from 'react';
import { Motion, spring } from 'react-motion';
import element from './App.css';

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            pointer: [-10,10],
            delta: [0,0],
            speed: [0,0],
            isPressed: false,
            messages: 4,
            position: 'left'
        };
      
        this._vW = window.innerWidth;
        this._vH = window.innerHeight;

        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handlePointerMove = this._handlePointerMove.bind(this);
        this._handlePointerDown = this._handlePointerDown.bind(this);
        this._handlePointerUp = this._handlePointerUp.bind(this);
        this._changeMessages = this._changeMessages.bind(this);
    }

    componentDidMount() {
        window.addEventListener('touchmove', this._handleTouchMove);
        window.addEventListener('touchend', this._handlePointerUp);
        window.addEventListener('mousemove', this._handlePointerMove);
        window.addEventListener('mouseup', this._handlePointerUp);
    }

    // Conveyts touch start to generic pointer down
    _handleTouchStart(pressLocation, e) {
        this._handlePointerDown(pressLocation, e.touches[0]);
    }

    // Conveys touch move event to generic pointer move
    _handleTouchMove(e) {
        e.preventDefault();
        this._handlePointerMove(e.touches[0]);
    }

    // When pointer moves set position and speed
    _handlePointerMove({pageX, pageY}) {
        const {isPressed, pointer: [px, py], delta: [dx, dy]} = this.state;

        if (isPressed) {

            // Pointer position is the coordinate - offset
            const pointer = [pageX - dx, pageY - dy];

            // Pointer speed is the difference between current and previous values
            const speed = [pointer[0] - px, pointer[1] - py];
            this.setState({pointer: pointer, speed: speed});
        }
    }

    // When pointer is pressed we set the offsets
    _handlePointerDown([pressX, pressY], {pageX, pageY}) {
        this.setState({
            isPressed: true,
            delta: [pageX - pressX, pageY - pressY],
            pointer: [pressX, pressY]
        });
    }

    // Handles touch finished
    _handlePointerUp() {      
        const vW = this._vW;
        const vH = this._vH;
        let x = 0;
        let y = 0;
        let position = 'left';

        // If pointer flicks to the right snap right
        if (this.state.speed[0] > 7) {
            x = vW - 50;
          
        // If mouse flicks to the left snap left
        } else if (this.state.speed[0] < -7) {
            x = -10;
          
        // Snap right or left
        } else {
            x = this.state.pointer[0] < vW / 2 ? -10 : vW - 50;
        }

        position = x === -10 ? 'left' : 'right';
        
        // Limit vertically
        if (this.state.pointer[1] < 10) {
            y = 10;
        } else if (this.state.pointer[1] > vH) {
            y = vH - 50;
        } else {
            y = this.state.pointer[1];
        }

        this.setState({isPressed: false, delta: [0, 0], pointer: [x, y], position: position});
    }
  
    _changeMessages(amount) {
      this.setState({messages: this.state.messages + amount});
    }

    render() {
        const springSettings = {
            stiffness: 200,
            damping: 12
        };
      
        let x = this.state.pointer[0];
        let y = this.state.pointer[1];

        if (this.state.position === 'left') {
          x = this.state.messages < 1 ? x - 100 : x; 
        }

        if (this.state.position === 'right') {
          x = this.state.messages < 1 ? x + 100 : x; 
        }

        return (
            <div>
                <Motion style={{
                    x: spring(x, springSettings),
                    y: spring(y, springSettings)}}>
                
                        {interpolatingStyle =>
                            <div
                                onMouseDown={this._handlePointerDown.bind(null, [interpolatingStyle.x, interpolatingStyle.y])}
                                onTouchStart={this._handleTouchStart.bind(null, [interpolatingStyle.x, interpolatingStyle.y])}
                                className={element.elem}
                                style={{
                                    left: interpolatingStyle.x + 'px',
                                    top: interpolatingStyle.y + 'px'}
                                }>
                                    <div className={element.chatHead}/>
                                    <div className={element.chatCounter + ' ' + element[this.state.position]}>{this.state.messages}</div>
                            </div>
                        }
                </Motion>
                <button onClick={this._changeMessages.bind(this,  1)}>Add</button>
                <button onClick={this._changeMessages.bind(this, -1)}>Remove</button>
            </div>
        );
    }
}

export default App;
