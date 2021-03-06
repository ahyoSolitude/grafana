import React from 'react';
import classNames from 'classnames';
import { PanelModel } from '../panel_model';
import { PanelContainer } from './PanelContainer';
import templateSrv from 'app/features/templating/template_srv';
import appEvents from 'app/core/app_events';

export interface DashboardRowProps {
  panel: PanelModel;
  getPanelContainer: () => PanelContainer;
}

export class DashboardRow extends React.Component<DashboardRowProps, any> {
  dashboard: any;
  panelContainer: any;

  constructor(props) {
    super(props);

    this.state = {
      collapsed: this.props.panel.collapsed,
    };

    this.panelContainer = this.props.getPanelContainer();
    this.dashboard = this.panelContainer.getDashboard();

    this.toggle = this.toggle.bind(this);
    this.openSettings = this.openSettings.bind(this);
  }

  toggle() {
    this.dashboard.toggleRow(this.props.panel);

    this.setState(prevState => {
      return { collapsed: !prevState.collapsed };
    });
  }

  openSettings() {
    appEvents.emit('show-modal', {
      templateHtml: `<row-options row="model.row" on-updated="model.onUpdated()" on-delete="model.onDelete()" dismiss="dismiss()"></row-options>`,
      modalClass: 'modal--narrow',
      model: {
        row: this.props.panel,
        onUpdated: this.forceUpdate.bind(this),
        onDelete: this.onDelete.bind(this),
      },
    });
  }

  onDelete() {
    let text2 = '';

    if (this.props.panel.panels.length) {
      text2 = `This will also remove the row's ${this.props.panel.panels.length} panels`;
    }

    appEvents.emit('confirm-modal', {
      title: 'Delete Row',
      text: 'Are you sure you want to remove this row?',
      text2: text2,
      icon: 'fa-trash',
      onConfirm: () => {
        const panelContainer = this.props.getPanelContainer();
        const dashboard = panelContainer.getDashboard();
        dashboard.removePanel(this.props.panel);
      },
    });
  }

  render() {
    const classes = classNames({ 'dashboard-row': true, 'dashboard-row--collapsed': this.state.collapsed });
    const chevronClass = classNames({
      fa: true,
      'fa-chevron-down': !this.state.collapsed,
      'fa-chevron-right': this.state.collapsed,
    });

    let title = templateSrv.replaceWithText(this.props.panel.title, this.props.panel.scopedVars);
    const hiddenPanels = this.props.panel.panels ? this.props.panel.panels.length : 0;

    return (
      <div className={classes}>
        <a className="dashboard-row__title pointer" onClick={this.toggle}>
          <i className={chevronClass} />
          {title}
          <span className="dashboard-row__panel_count">({hiddenPanels} hidden panels)</span>
        </a>
        <div className="dashboard-row__actions">
          <a className="pointer" onClick={this.openSettings}>
            <i className="fa fa-cog" />
          </a>
        </div>
        <div className="dashboard-row__drag grid-drag-handle" />
      </div>
    );
  }
}
