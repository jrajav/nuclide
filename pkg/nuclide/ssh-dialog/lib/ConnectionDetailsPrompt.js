'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ConnectionDetailsForm from './ConnectionDetailsForm';
import NuclideMutableListSelector from 'nuclide-ui-mutable-list-selector';
import React from 'react-for-atom';

import type {NuclideRemoteConnectionProfile} from './connection-types';

type DefaultProps = {};
type Props = {
  // The initial list of connection profiles that will be displayed.
  // Whenever a user add/removes profiles via the child NuclideListSelector,
  // these props should be updated from the top-level by calling React.render()
  // again (with the new props) on the ConnectionDetailsPrompt.
  connectionProfiles: ?Array<NuclideRemoteConnectionProfile>;
  // If there is >= 1 connection profile, this index indicates the initial
  // profile to use.
  indexOfInitiallySelectedConnectionProfile: ?number;
  // Function to call when 'enter'/'confirm' is selected by the user in this view.
  onConfirm: () => mixed;
  // Function to call when 'cancel' is selected by the user in this view.
  onCancel: () => mixed;
  // Function that is called when the "+" button on the profiles list is clicked.
  // The user's intent is to create a new profile.
  onAddProfileClicked: () => mixed;
  // Function that is called when the "-" button on the profiles list is clicked
  // ** while a profile is selected **.
  // The user's intent is to delete the currently-selected profile.
  onDeleteProfileClicked: (indexOfSelectedConnectionProfile: number) => mixed;
};
type State = {
  indexOfSelectedConnectionProfile: ?number;
};

/**
 * This component contains the entire view in which the user inputs their
 * connection information when connecting to a remote project.
 * This view contains the ConnectionDetailsForm on the left side, and a
 * NuclideListSelector on the right side that displays 0 or more connection
 * 'profiles'. Clicking on a 'profile' in the NuclideListSelector auto-fills
 * the form with the information associated with that profile.
 */
export default class ConnectionDetailsPrompt
    extends React.Component<DefaultProps, Props, State> {
  _idToConnectionProfile: ?Map<string, NuclideRemoteConnectionProfile>;
  _boundOnItemClicked: (profileId: string) => void;
  _boundOnDeleteProfileClicked: (profileId: ?string) => void;

  constructor(props: Props) {
    super(props);
    this._boundOnItemClicked = this._onItemClicked.bind(this);
    this._boundOnDeleteProfileClicked = this._onDeleteProfileClicked.bind(this);
    this.state = {
      indexOfSelectedConnectionProfile: this.props.indexOfSelectedConnectionProfile,
    };
  }

  render() {
    // If there are profiles, pre-fill the form with the information from the
    // specified default profile.
    let initialConnectionParams = {};
    if (this.props.connectionProfiles &&
        this.props.connectionProfiles.length &&
        this.state.indexOfInitiallySelectedConnectionProfile != null) {
      const initialProfile =
          this.props.connectionProfiles[this.state.indexOfInitiallySelectedConnectionProfile];
      initialConnectionParams = initialProfile.params;
    }

    // Create helper data structures.
    const listSelectorItems = [];
    if (this.props.connectionProfiles) {
      this.props.connectionProfiles.forEach((profile, index) => {
        // Use the index of each profile as its id. This is safe because the
        // items are immutable (within this React component).
        listSelectorItems.push({id: index, displayTitle: profile.displayTitle});
      });
    }

    return (
      <div className="nuclide-connection-details-prompt">
        <div className="left-column">
          <ConnectionDetailsForm
            initialUsername={initialConnectionParams.username}
            initialServer={initialConnectionParams.server}
            initialRemoteServerCommand={initialConnectionParams.remoteServerCommand}
            initialCwd={initialConnectionParams.cwd}
            initialSshPort={initialConnectionParams.sshPort}
            initialPathToPrivateKey={initialConnectionParams.pathToPrivateKey}
            initialAuthMethod={initialConnectionParams.authMethod}
            onConfirm={this.props.onConfirm}
            onCancel={this.props.onCancel}
          />
        </div>
        <div className="right-column">
          <title>Profiles</title>
          <NuclideMutableListSelector
            items={listSelectorItems}
            onItemClicked={this._boundOnProfileClicked}
            onAddItemClicked={this.props.onAddProfileClicked}
            onDeleteItemClicked={this._boundOnDeleteProfileClicked}
          />
        </div>
      </div>
    );
  }

  _onProfileClicked(profileId: string): void {
    // The id of a profile is its index in the list of props.
    this.setState({indexOfSelectedConnectionProfile: profileId});
  }

  _onDeleteProfileClicked(profileId: ?string): void {
    if (profileId == null) {
      return;
    }
    // The id of a profile is its index in the list of props.
    this.props.onDeleteProfileClicked(parseInt(profileId, 10));
  }
}
