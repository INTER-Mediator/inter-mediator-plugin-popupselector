/*
 * INTER-Mediator
 * Copyright (c) INTER-Mediator Directive Committee (http://inter-mediator.org)
 * This project started at the end of 2009 by Masayuki Nii msyk@msyk.net.
 *
 * INTER-Mediator is supplied under MIT License.
 * Please see the full license for details:
 * https://github.com/INTER-Mediator/INTER-Mediator/blob/master/dist-docs/License.txt
 */
IMParts_Catalog.popupselector = {
    instanciate: function (parentNode) {
        'use strict'
        var widgetId, node, inNode, valueNode
        if (parentNode.getAttribute('class') !== '_im_widget_popup') {
            parentNode.setAttribute('class', '_im_widget_popup')
            parentNode.style.zIndex = (IMParts_Catalog.popupselector.zIndex--)
            node = document.createElement('SPAN')
            node.setAttribute('data-im-control', 'enclosure')
            node.setAttribute('class', '_im_widget_popup_panel')
            parentNode.appendChild(node)
            IMParts_Catalog.popupselector.selectionRoots.push(node)
            inNode = document.createElement('SPAN')
            inNode.setAttribute('data-im-control', 'repeater')
            inNode.setAttribute('data-im', parentNode.getAttribute('data-im-popup'))
            node.appendChild(inNode)
            inNode = document.createElement('DIV')
            inNode.setAttribute('class', '_im_widget_popup_close')
            inNode.appendChild(document.createTextNode('×'))
            node.appendChild(inNode)
            INTERMediatorLib.addEvent(inNode, 'click', (function () {
                return function () {
                    IMParts_Catalog.popupselector.clearSelection()
                }
            })())
            widgetId = parentNode.getAttribute('id')
            IMParts_Catalog.popupselector.ids.push(widgetId)

            valueNode = document.createElement('span')
            valueNode.setAttribute('class', '_im_widget_popup_value')
            INTERMediatorLib.addEvent(valueNode, 'click', (function () {
                var selRoot = node
                return function () {
                    IMParts_Catalog.popupselector.clearSelection()
                    IMParts_Catalog.popupselector.clickValue(selRoot)
                }
            })())
            parentNode.appendChild(valueNode)

            parentNode._im_getComponentId = (function () {
                var theId = widgetId
                return function () {
                    return theId
                }
            })()

            parentNode._im_setValue = (function () {
                var theId = widgetId
                return function (str) {
                    IMParts_Catalog.popupselector.initialValues[theId] = str
                }
            })()
        }
    },

    ids: [],
    selectionRoots: [],
    initialValues: {},
    zIndex: 9000,

    finish: function () {
        'use strict'
        var i, targetId, targetNode, j, nodes, selectionRoot, nodeValue, displayValue, innodes, k
        for (i = 0; i < IMParts_Catalog.popupselector.ids.length; i += 1) {
            targetId = IMParts_Catalog.popupselector.ids[i]
            targetNode = document.getElementById(targetId)
            selectionRoot = IMParts_Catalog.popupselector.selectionRoots[i]
            nodeValue = IMParts_Catalog.popupselector.initialValues[targetId]
            if (selectionRoot) {
                displayValue = null
                nodes = selectionRoot.childNodes
                for (j = 0; j < nodes.length; j++) {
                    if (nodes[j] &&
                        nodes[j].nodeType === 1 &&
                        nodes[j].getAttribute('data-im-control') === 'repeater') {
                        nodes[j].setAttribute('class', '_im_widget_popup_selection')
                        if (nodeValue === nodes[j].getAttribute('data-im-value')) {
                            displayValue = nodes[j].innerHTML
                            nodes[j].setAttribute('class', '_im_widget_popup_selection _im_widget_popup_selected')
                        }
                        IMLibMouseEventDispatch.setExecute(nodes[j].id, (function () {
                            // Execute on clicking the selection
                            var node = nodes[j]
                            return function () {
                                IMParts_Catalog.popupselector.clearSelection()
                                IMParts_Catalog.popupselector.setData(node)
                            }
                        })())
                    }
                }
                if (targetNode) {
                    innodes = targetNode.getElementsByClassName('_im_widget_popup_value')
                    for (k = 0; k < innodes.length; k++) {
                        innodes[k].innerHTML = displayValue ? displayValue : '[Not selected]'
                    }
                }
            }
        }
    },

    clickValue: function (selectionRoot) {
        'use strict'
        var body, panelBack
        selectionRoot.style.display = 'block'
        body = document.getElementsByTagName('BODY')[0]
        panelBack = document.createElement('DIV')
        body.appendChild(panelBack)
        panelBack.setAttribute('class', '_im_widget_popup_panelback')
        panelBack.setAttribute('id', '_im_widget_popup_panelback')
        panelBack.style.width = body.clientWidth + 'px'
        panelBack.style.height = body.clientHeight + 'px'
        IMLibMouseEventDispatch.setExecute('_im_widget_popup_panelback', function () {
            IMParts_Catalog.popupselector.clearSelection()
        })
    },

    clearSelection: function () {
        'use strict'
        var i, body, targetNode, selectionRoot
        body = document.getElementsByTagName('BODY')[0]
        targetNode = document.getElementById('_im_widget_popup_panelback')
        if (targetNode) {
            body.removeChild(targetNode)
        }
        for (i = 0; i < IMParts_Catalog.popupselector.ids.length; i += 1) {
            selectionRoot = IMParts_Catalog.popupselector.selectionRoots[i]
            if (selectionRoot) {
                selectionRoot.style.display = 'none'
            }
        }
    },

    setData: function (node) {
        'use strict'
        var i, selectedData, target, targetField, bindingId, keyRec, nodes, contextInfo
        selectedData = node.getAttribute('data-im-value')
        target = node.parentNode.parentNode.getAttribute('data-im').split(' ')[0].split('@')
        targetField = target[1]
        bindingId = node.parentNode.parentNode.id
        contextInfo = IMLibContextPool.getContextInfoFromId(bindingId, target[2])
        keyRec = contextInfo.record.split('=')
        contextInfo.context.setDataWithKey(keyRec[1], targetField, selectedData)
        nodes = node.parentNode.parentNode.getElementsByClassName('_im_widget_popup_value')
        for (i = 0; i < nodes.length; i += 1) {
            nodes[i].innerHTML = node.innerHTML
        }
        nodes = node.parentNode.getElementsByClassName('_im_widget_popup_selection')
        for (i = 0; i < nodes.length; i += 1) {
            if (node.getAttribute('data-im-value') === nodes[i].getAttribute('data-im-value')) {
                nodes[i].setAttribute('class', '_im_widget_popup_selection _im_widget_popup_selected')
            } else {
                nodes[i].setAttribute('class', '_im_widget_popup_selection')
            }
        }
    }
}
