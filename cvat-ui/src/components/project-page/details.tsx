// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';

import getCore from 'cvat-core-wrapper';
import { Project, CombinedState } from 'reducers/interfaces';
import { updateProjectAsync } from 'actions/projects-actions';
import LabelsEditor from 'components/labels-editor/labels-editor';
import BugTrackerEditor from 'components/task-page/bug-tracker-editor';
import UserSelector from 'components/task-page/user-selector';

const core = getCore();

interface DetailsComponentProps {
    project: Project;
}

export default function DetailsComponent(props: DetailsComponentProps): JSX.Element {
    const { project } = props;

    const dispatch = useDispatch();
    const registeredUsers = useSelector((state: CombinedState) => state.users.users);
    const [projectName, setProjectName] = useState(project.name);

    return (
        <div className='cvat-project-details'>
            <Row>
                <Col>
                    <Title
                        level={4}
                        editable={{
                            onChange: (value: string): void => {
                                setProjectName(value);
                                project.name = value;
                                dispatch(updateProjectAsync(project));
                            },
                        }}
                        className='cvat-text-color'
                    >
                        {projectName}
                    </Title>
                </Col>
            </Row>
            <Row type='flex' justify='space-between'>
                <Col>
                    <Text type='secondary'>
                        {`Project #${project.id} created`}
                        {project.owner ? ` by ${project.owner.username}` : null}
                        {` on ${moment(project.createdDate).format('MMMM Do YYYY')}`}
                    </Text>
                    <BugTrackerEditor
                        instance={project}
                        onChange={(_project): void => {
                            dispatch(updateProjectAsync(_project));
                        }}
                    />
                </Col>
                <Col>
                    <Text type='secondary'>Assigned to</Text>
                    <UserSelector
                        value={project.assignee}
                        users={registeredUsers}
                        onChange={(value) => {
                            let [userInstance] = registeredUsers.filter((user: any) => user.username === value);

                            if (userInstance === undefined) {
                                userInstance = null;
                            }

                            project.assignee = userInstance;
                            dispatch(updateProjectAsync(project));
                        }}
                    />
                </Col>
            </Row>
            <LabelsEditor
                labels={project.labels.map((label: any): string => label.toJSON())}
                onSubmit={(labels: any[]): void => {
                    project.labels = labels.map((labelData): any => new core.classes.Label(labelData));
                    dispatch(updateProjectAsync(project));
                }}
            />
        </div>
    );
}