'use strict';

let log = ocw.Log();
let api = ocw.Api();

let j = ocw.status.J();
j.readStatus().done((status) => {
    let m = status.map((value, index) => ocw.move.M(index, value));
    let vue = new Vue({
        el: '#app',
        data: () => {
            let data = {
                lazyUpdate: true,
                lazyUpdateChange: () => {
                    m.forEach((item) => vue.$data['b' + item.getIndex()].lazy = vue.$data.lazyUpdate);
                },
                autoUpdate: false,
                autoUpdateRate: (rate) => {
                    setTimeout(() => {
                        if (vue.$data.autoUpdate) {
                            j.readStatus().done((status) => {
                                status.forEach((value, index) => {
                                    m[index].setValue(value);
                                    vue.$refs['m' + index][0].setValue(value);
                                });
                                vue.$data.autoUpdateRate(rate);
                            });
                        } else {
                            vue.$data.autoUpdateRate(rate);
                        }
                    }, rate);
                },
                command: '',
                commandWrite: () => {
                    if (vue.$data.command) {
                        ocw.Command(vue.$data.command).writeCommand();
                    }
                },
                sliders: [
                    {
                        id: 0,
                        name: 'hPan',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 1,
                        name: 'hTilt',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -80,
                        max: 50
                    },
                    {
                        id: 2,
                        name: 'tPan',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 3,
                        name: 'N/A',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 4,
                        name: 'rFL',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 5,
                        name: 'rFR',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 6,
                        name: 'rHR',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 7,
                        name: 'rHL',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 8,
                        name: 'sFL',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 9,
                        name: 'sFR',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 10,
                        name: 'sHR',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 11,
                        name: 'sHL',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 12,
                        name: 'kFL',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 13,
                        name: 'kFR',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 14,
                        name: 'kHR',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    },
                    {
                        id: 15,
                        name: 'kHL',
                        direction: 'rtl',
                        top: 10,
                        left: 10,
                        min: -60,
                        max: 60
                    }
                ],
                change: function (index) {
                    let value = vue.$data['m' + index];
                    if (value != m[index].getValue()) {
                        m[index].writeValue(value);
                        m.forEach((item) => {
                            let sync = vue.$data['b' + index].sync && vue.$data['b' + item.getIndex()].sync;
                            if (index != item.getIndex() && sync) {
                                vue.$refs['m' + item.getIndex()][0].setValue(value);
                            }
                        });
                    }
                },
                dragstart: () => {
                    $(vue.$refs.autoUpdate).data('checked', vue.$data.autoUpdate);
                    vue.$set(vue.$refs.autoUpdate, 'checked', false);
                },
                dragend: () => {
                    vue.$set(vue.$refs.autoUpdate, 'checked', $(vue.$refs.autoUpdate).data('checked'));
                }
            };
            m.forEach((item) => {
                let slider = data.sliders.filter(s => s.id == item.getIndex())[0];
                data['m' + item.getIndex()] = item.getValue();
                data['b' + item.getIndex()] = $.extend(slider, {
                        dotSize: 20,
                        tooltip: 'always',
                        tooltipPlacement: 'top',
                        interval: 1,
                        duration: 0,
                        lazy: true,
                        contained: false,
                        useKeyboard: true,
                        sync: false
                    },
                    {
                        sid: 's' + item.getIndex(),
                        mid: 'm' + item.getIndex(),
                        bid: 'b' + item.getIndex(),
                        style: 'slider ' + slider.direction + ' ' + ([3, 4, 5, 6, 7].includes(slider.id) ? 'inactive' : 'active'),
                        width: ['ltr', 'rtl'].includes(slider.direction) ? 300 : 5,
                        height: ['ttb', 'btt'].includes(slider.direction) ? 300 : 5,
                        process: (p) => [[(Math.abs(slider.min) * 100 / (Math.abs(slider.min) + Math.abs(slider.max))), p[0]]]
                    });
            });
            return data;
        },
        components: {
            'vueSlider': window['vue-slider-component'],
        }
    });
    vue.$data.autoUpdateRate(1000);
});
