// main.js
var React = require('react');
var ReactDOM = require('react-dom');


var App = React.createClass({
    render: function() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-6">HOLA</div>
                    <div className="col-sm-6">adios</div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('content')
);
