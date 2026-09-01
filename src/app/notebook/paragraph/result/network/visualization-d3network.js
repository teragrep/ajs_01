/*
 * Teragrep User Interface (ajs_01)
 * Copyright (C) 2019-2026 Suomen Kanuuna Oy
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *
 * Additional permission under GNU Affero General Public License version 3
 * section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with other code, such other code is not for that reason alone subject to any
 * of the requirements of the GNU Affero GPL version 3 as long as this Program
 * is the same Program as licensed from Suomen Kanuuna Oy without any additional
 * modifications.
 *
 * Supplemented terms under GNU Affero General Public License version 3
 * section 7
 *
 * Origin of the software must be attributed to Suomen Kanuuna Oy. Any modified
 * versions must be marked as "Modified version of" The Program.
 *
 * Names of the licensors and authors may not be used for publicity purposes.
 *
 * No rights are granted for use of trade names, trademarks, or service marks
 * which are in The Program if any.
 *
 * Licensee must indemnify licensors and authors for any liability that these
 * contractual assumptions impose on licensors and authors.
 *
 * To the extent this program is licensed as part of the Commercial versions of
 * Teragrep, the applicable Commercial License may apply to this file if you as
 * a licensee so wish it.
 */
/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Visualization from '../baseClasses/visualization';
import d3 from 'd3';
import _ from 'lodash';

/**
 * Visualize data in network format
 */
export default class NetworkVisualization extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config);

    if (!config.properties) {
      config.properties = {};
    }
    if (!config.d3Graph) {
      config.d3Graph = {
        forceLayout: {
          timeout: 10000,
          charge: -120,
          linkDistance: 80,
        },
        zoom: {
          minScale: 1.3,
        },
      };
    }
    this.targetEl.addClass('network');
    this.containerId = this.targetEl.prop('id');
    this.force = null;
    this.svg = null;
    this.$timeout = angular.injector(['ng']).get('$timeout');
    this.$interpolate = angular.injector(['ng']).get('$interpolate');
    this.transformation = config;
  }

  refresh() {

  }

  render(networkData) {
    if (!('graph' in networkData)) {

      return;
    }
    if (!networkData.isRendered) {
      networkData.isRendered = true;
    } else {
      return;
    }


    if (networkData.graph.edges.length &&
      !networkData.isDefaultSet) {
      networkData.isDefaultSet = true;
      this._setEdgesDefaults(networkData.graph);
    }

    const transformationConfig = this.transformation;

    if (transformationConfig && angular.equals({}, transformationConfig.properties)) {
      transformationConfig.properties = this.getNetworkProperties(networkData.graph);
    }

    this.targetEl.empty().append('<svg></svg>');

    const width = this.targetEl.width();
    const height = this.targetEl.height();
    const self = this;
    const defaultOpacity = 0;
    const nodeSize = 7;
    const textOffset = 3;
    const linkSize = 10;

    const arcPath = (leftHand, d) => {
      const start = leftHand ? d.source : d.target;
      const end = leftHand ? d.target : d.source;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dr = d.totalCount === 1
        ? 0 : Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / (1 + 1 / d.totalCount * (d.count - 1));
      const sweep = leftHand ? 0 : 1;
      return `M${start.x},${start.y}A${dr},${dr} 0 0,${sweep} ${end.x},${end.y}`;
    };

    const drag = d3.behavior.drag()
      .origin((d) => d)
      .on('dragstart', function(d) {

        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed('dragging', true);
        self.force.stop();
      })
      .on('drag', function(d) {

        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
      })
      .on('dragend', function(d) {

        d.fixed = true;
        d3.select(this).classed('dragging', false);
        self.force.resume();
      });
    const showLabel = (d) => this._showNodeLabel(d);

    const renderFooterOnClick = (entity, type) => {
      const footerId = `${this.containerId}_footer`;
      const obj = {id: entity.id, label: entity.defaultLabel || entity.label, type: type};
      let html = [`<li><b>${obj.type}_id:</b>&nbsp${obj.id}</li>`];
      if (obj.label) {
        html.push(`<li><b>${obj.type}_type:</b>&nbsp${obj.label}</li>`);
      }
      html = html.concat(_.map(entity.data, (v, k) => {
        return `<li><b>${k}:</b>&nbsp${v}</li>`;
      }));
      angular.element(`#${footerId}`)
        .find('.list-inline')
        .empty()
        .append(html.join(''));
    };
    const container = this.svg.append('g');
    const link = container.append('svg:g')
      .on('click', () => {
        renderFooterOnClick(d3.select(d3.event.target).datum(), 'edge');
      })
      .selectAll('g.link')
      .data(self.force.links())
      .enter()
      .append('g');
    const getPathId = (d) => `${this.containerId}_${d.source.index}_${d.target.index}_${d.count}`;

    const linkPath = link.append('svg:path')
      .attr('class', 'link')
      .attr('size', linkSize)
      .attr('marker-end', `url(#arrowMarker-${this.containerId})`);
    const textPath = link.append('svg:path')
      .attr('id', getPathId)
      .attr('class', 'textpath');
    container.append('svg:g')
      .selectAll('.pathLabel')
      .data(self.force.links())
      .enter()
      .append('svg:text')
      .attr('class', 'pathLabel')
      .append('svg:textPath')
      .attr('startOffset', '50%')
      .attr('text-anchor', 'middle')
      .attr('xlink:href', (d) => `#${getPathId(d)}`)
      .text((d) => d.label)
      .style('opacity', defaultOpacity);

    // Nodes
    const circle = container.append('svg:g')
      .on('click', () => {
        renderFooterOnClick(d3.select(d3.event.target).datum(), 'node');
      })
      .selectAll('circle')
      .data(self.force.nodes())
      .enter().append('svg:circle')
      .attr('r', (d) => nodeSize)
      .attr('class', (d) => networkData.graph.labels && d.label in networkData.graph.labels
        ? networkData.graph.labels[d.label] : '#000000')
      .call(drag);
    const text = container.append('svg:g').selectAll('g')
      .data(self.force.nodes())
      .enter().append('svg:g');
    text.append('svg:text')
      .attr('x', (d) => nodeSize + textOffset)
      .attr('size', nodeSize)
      .attr('y', '.31em')
      .attr('class', (d) => `nodeLabel shadow label-${d.label}`)
      .text(showLabel)
      .style('opacity', defaultOpacity);
    text.append('svg:text')
      .attr('x', (d) => nodeSize + textOffset)
      .attr('size', nodeSize)
      .attr('y', '.31em')
      .attr('class', (d) => `nodeLabel label-${d.label}`)
      .text(showLabel)
      .style('opacity', defaultOpacity);

    // Use elliptical arc path segments to doubly-encode directionality.
    const tick = () => {
      // Links
      linkPath.attr('d', function(d) {
        return arcPath(true, d);
      });
      textPath.attr('d', function(d) {
        return arcPath(d.source.x < d.target.x, d);
      });
      // Nodes
      circle.attr('transform', (d) => `translate(${d.x},${d.y})`);
      text.attr('transform', (d) => `translate(${d.x},${d.y})`);
    };

    const setOpacity = (scale) => {
      const opacity = scale >= +transformationConfig.d3Graph.zoom.minScale ? 1 : 0;
      this.svg.selectAll('.nodeLabel')
        .style('opacity', opacity);
      this.svg.selectAll('textPath')
        .style('opacity', opacity);
    };


    const zoom = d3.behavior.zoom()
      .scaleExtent([1, 10])
      .on('zoom', () => {
        setOpacity(d3.event.scale);
        container.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
      });

    this.svg = d3.select(`#${this.containerId} svg`)
      .attr('width', width)
      .attr('height', height)
      .call(zoom);

    this.force = d3.layout.force()
      .charge(transformationConfig.d3Graph.forceLayout.charge)
      .linkDistance(transformationConfig.d3Graph.forceLayout.linkDistance)
      .on('tick', tick)
      .nodes(networkData.graph.nodes)
      .links(networkData.graph.edges)
      .size([width, height])
      .on('start', () => {

        this.$timeout(() => {
          this.force.stop();
        }, transformationConfig.d3Graph.forceLayout.timeout);
      })
      .on('end', () => {

        setOpacity(zoom.scale());
      })
      .start();


    if (networkData.graph.directed) {
      container.append('svg:defs').selectAll('marker')
        .data([`arrowMarker-${this.containerId}`])
        .enter()
        .append('svg:marker')
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 16)
        .attr('refY', 0)
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');
    }
    // Links


  }

  destroy() { //why do they even have empty functions here?
  }

  _showNodeLabel(d) {
    const transformationConfig = this.transformation;
    const selectedLabel = (transformationConfig.properties[d.label] || {selected: 'label'}).selected;
    return d.data[selectedLabel] || d[selectedLabel];
  }

  setNodesDefaults() {//another empty function
  }

  _setEdgesDefaults(graph) {
    graph.edges
      .sort((a, b) => {
        if (a.source > b.source) {
          return 1;
        } else if (a.source < b.source) {
          return -1;
        } else if (a.target > b.target) {
          return 1;
        } else if (a.target < b.target) {
          return -1;
        } else {
          return 0;
        }
      });
    graph.edges
      .forEach((edge, index) => {
        const prevEdge = graph.edges[index - 1];
        edge.count = (index > 0 && +edge.source === +prevEdge.source && +edge.target === +prevEdge.target
          ? prevEdge.count : 0) + 1;
        edge.totalCount = graph.edges
          .filter((innerEdge) => +edge.source === +innerEdge.source && +edge.target === +innerEdge.target)
          .length;
      });
    graph.edges
      .forEach((edge) => {
        if (typeof +edge.source === 'number') {
          // edge.source = graph.nodes.filter((node) => +edge.source === +node.id)[0] || null
          edge.source = _.find(graph.nodes, (node) => +edge.source === +node.id);
        }
        if (typeof +edge.target === 'number') {
          // edge.target = graph.nodes.filter((node) => +edge.target === +node.id)[0] || null
          edge.target = _.find(graph.nodes, (node) => +edge.target === +node.id);
        }
      });
  }

  getNetworkProperties(graph) {
    const baseCols = ['id', 'label'];
    const properties = {};
    graph.nodes.forEach(function(node) {
      const hasLabel = 'label' in node && node.label !== '';
      if (!hasLabel) {
        return;
      }
      const label = node.label;
      const hasKey = hasLabel && label in properties;
      const keys = _.uniq(Object.keys(node.data || {})
        .concat(hasKey ? properties[label].keys : baseCols));
      if (!hasKey) {
        properties[label] = {selected: 'label'};
      }
      properties[label].keys = keys;
    });
    return properties;
  }
}
