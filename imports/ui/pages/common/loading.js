import "./loading.html"

Template.allLoading.onRendered(function() {

    var loaders = [
        {
            width: 100,
            height: 100,

            stepsPerFrame: 1,
            trailLength: 1,
            pointDistance: .02,
            fps: 30,

            fillColor: '#05E2FF',

            step: function(point, index) {
                this._.beginPath();
                this._.moveTo(point.x, point.y);
                this._.arc(point.x, point.y, index * 7, 0, Math.PI*2, false);
                this._.closePath();
                this._.fill();

            },
            path: [
                ['arc', 50, 50, 30, 0, 360]
            ]
        },
    ];

    var container = document.getElementById('mengban');



    var d = document.createElement('div');

    var a = new Sonic(loaders[0]);

    d.appendChild(a.canvas);
    container.appendChild(d);

    a.play();
})

Template.allLoading.events({
    "resize window": function (e) {

    },
});


