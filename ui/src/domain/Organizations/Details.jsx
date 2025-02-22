import { React, useState, useEffect } from "react";
import {
  Button,
  Layout,
  Breadcrumb,
  Input,
  List,
  Space,
  Card,
  Tag,
  Tooltip,
  Radio,
} from "antd";
import {
  GitlabOutlined,
  GithubOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { BiTerminal } from "react-icons/bi";
import { SiTerraform, SiBitbucket, SiAzuredevops } from "react-icons/si";
import { IconContext } from "react-icons";
import axiosInstance from "../../config/axiosConfig";
import { useParams, useHistory } from "react-router-dom";
import {
  ORGANIZATION_ARCHIVE,
  ORGANIZATION_NAME,
} from "../../config/actionTypes";
const { Content } = Layout;
const { DateTime } = require("luxon");
const { Search } = Input;
const include = {
  WORKSPACE: "workspace",
};

export const OrganizationDetails = ({
  setOrganizationName,
  organizationName,
}) => {
  const { id } = useParams();
  const [organization, setOrganization] = useState({});
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const history = useHistory();
  const handleCreate = (e) => {
    history.push("/workspaces/create");
  };

  const renderVCSLogo = (hostname) => {
    if (hostname.includes("gitlab"))
      return (
        <Tooltip title="Gitlab">
          <GitlabOutlined style={{ fontSize: "18px" }} />
        </Tooltip>
      );
    if (hostname.includes("bitbucket"))
      return (
        <IconContext.Provider value={{ size: "18px" }}>
          <Tooltip title="Bit Bucket">
            <SiBitbucket />
          </Tooltip>
        </IconContext.Provider>
      );
    if (hostname.includes("azure"))
      return (
        <IconContext.Provider value={{ size: "18px" }}>
          <Tooltip title="Azure Devops">
            <SiAzuredevops />
          </Tooltip>
        </IconContext.Provider>
      );

    return (
      <Tooltip title="Github">
        <GithubOutlined style={{ fontSize: "18px" }} />
      </Tooltip>
    );
  };

  const handleClick = (id) => {
    console.log(id);
    history.push("/workspaces/" + id);
  };

  const onFilterChange = (e) => {
    setFilterValue(e.target.value);
    applyFilters(searchValue, e.target.value);
  };

  const onRadioClick = (e) => {
    const tag = e.target;
    if (tag.type === "radio" && filterValue === tag.value.toString()) {
      setFilterValue("");
      applyFilters(searchValue, "");
    }
  };

  const onSearch = (value) => {
    setSearchValue(value);
    applyFilters(value, filterValue);
  };

  const applyFilters = (searchValue, filterValue) => {
    if (searchValue !== "" && filterValue !== "") {
      console.log("filter by both");
      var filteredWorkspaces = workspaces.filter(
        (workspace) =>
          workspace.name.includes(searchValue) &&
          workspace.lastStatus === filterValue
      );
      setFilteredWorkspaces(filteredWorkspaces);
      return;
    }

    if (searchValue !== "") {
      console.log("filter by name " + searchValue);
      var filteredWorkspaces = workspaces.filter((workspace) =>
        workspace.name.includes(searchValue)
      );
      setFilteredWorkspaces(filteredWorkspaces);
      return;
    }

    if (filterValue !== "") {
      console.log("filter by status " + filterValue);
      var filteredWorkspaces = workspaces.filter(
        (workspace) => workspace.lastStatus === filterValue
      );
      setFilteredWorkspaces(filteredWorkspaces);
      return;
    }
    console.log("no filter");
    setFilteredWorkspaces(workspaces);
  };
  useEffect(() => {
    setLoading(true);
    localStorage.setItem(ORGANIZATION_ARCHIVE, id);
    axiosInstance
      .get(`organization/${id}?include=workspace,job`)
      .then((response) => {
        console.log(response);
        setOrganization(response.data);

        if (response.data.included) {
          setupOrganizationIncludes(
            response.data.included,
            setWorkspaces,
            setFilteredWorkspaces
          );
        }

        setLoading(false);
        localStorage.setItem(
          ORGANIZATION_NAME,
          response.data.data.attributes.name
        );
        setOrganizationName(response.data.data.attributes.name);
      });
  }, [id]);

  return (
    <Content style={{ padding: "0 50px" }}>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>{organizationName}</Breadcrumb.Item>
        <Breadcrumb.Item>Workspaces</Breadcrumb.Item>
      </Breadcrumb>
      <div className="site-layout-content">
        {loading || !organization.data || !workspaces ? (
          <p>Data loading...</p>
        ) : (
          <div className="workspaceWrapper">
            <div className="variableActions">
              <h2>Workspaces</h2>
              <Button type="primary" htmlType="button" onClick={handleCreate}>
                New workspace
              </Button>
            </div>
            <div style={{ clear: "both", width: "100%" }}>
              <div
                onClick={onRadioClick}
                style={{ width: "50%", float: "left" }}
              >
                {" "}
                <Radio.Group onChange={onFilterChange} value={filterValue}>
                  {" "}
                  <Tooltip
                    placement="bottom"
                    title="Show only workspaces needing attention"
                  >
                    <Radio.Button value="waitingApproval">
                      <ExclamationCircleOutlined style={{ color: "#fa8f37" }} />
                    </Radio.Button>{" "}
                  </Tooltip>
                  <Tooltip
                    placement="bottom"
                    title="Show only workspaces with error"
                  >
                    <Radio.Button value="failed">
                      <StopOutlined style={{ color: "#FB0136" }} />
                    </Radio.Button>{" "}
                  </Tooltip>
                  <Tooltip
                    placement="bottom"
                    title="Show only running workspaces"
                  >
                    <Radio.Button value="running">
                      {" "}
                      <SyncOutlined style={{ color: "#108ee9" }} />
                    </Radio.Button>
                  </Tooltip>
                  <Tooltip
                    placement="bottom"
                    title="Show only successfully completed workspaces"
                  >
                    <Radio.Button value="completed">
                      <CheckCircleOutlined style={{ color: "#2eb039" }} />
                    </Radio.Button>
                  </Tooltip>{" "}
                  <Tooltip
                    placement="bottom"
                    title="Show only never executed workspaces"
                  >
                    <Radio.Button value="never executed">
                      <InfoCircleOutlined />
                    </Radio.Button>
                  </Tooltip>
                </Radio.Group>
              </div>
              <div style={{ float: "left", width: "50%" }}>
                {" "}
                <Search
                  placeholder="Search by name"
                  onSearch={onSearch}
                  allowClear
                  style={{ width: "100%" }}
                />{" "}
              </div>
            </div>
            <div style={{ clear: "both", paddingTop: "10px" }}>
              <List
                split=""
                className="workspaceList"
                dataSource={filteredWorkspaces}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      onClick={() => handleClick(item.id)}
                      style={{ width: "100%" }}
                      hoverable
                    >
                      <Space
                        style={{ color: "rgb(82, 87, 97)" }}
                        direction="vertical"
                      >
                        <h3>{item.name}</h3>
                        {item.description}
                        <Space size={40} style={{ marginTop: "25px" }}>
                          <Tag
                            icon={
                              item.lastStatus == "completed" ? (
                                <CheckCircleOutlined />
                              ) : item.lastStatus == "running" ? (
                                <SyncOutlined spin />
                              ) : item.lastStatus === "waitingApproval" ? (
                                <ExclamationCircleOutlined />
                              ) : item.lastStatus === "never executed" ? (
                                <InfoCircleOutlined />
                              ) : item.lastStatus === "rejected" ? (
                                <CloseCircleOutlined />
                              ) : item.lastStatus === "cancelled" ? (
                                <StopOutlined />
                              ) : item.lastStatus === "failed" ? (
                                <StopOutlined />
                              ) : (
                                <ClockCircleOutlined />
                              )
                            }
                            color={item.statusColor}
                          >
                            {item.lastStatus}
                          </Tag>{" "}
                          <br />
                          <span>
                            <ClockCircleOutlined />
                            &nbsp;&nbsp;
                            {DateTime.fromISO(item.lastRun).toRelative() ??
                              "never executed"}
                          </span>
                          <span>
                            <IconContext.Provider value={{ size: "1.3em" }}>
                              <SiTerraform />
                            </IconContext.Provider>
                            &nbsp;&nbsp;{item.terraformVersion}
                          </span>
                          {item.branch !== "remote-content" ? (
                            <span>
                              {renderVCSLogo(
                                new URL(fixSshURL(item.source)).hostname
                              )}
                              &nbsp;{" "}
                              <a href={fixSshURL(item.source)} target="_blank">
                                {new URL(fixSshURL(item.source))?.pathname
                                  ?.replace(".git", "")
                                  ?.substring(1)}
                              </a>
                            </span>
                          ) : (
                            <span
                              style={{
                                verticalAlign: "middle",
                                display: "inline-block",
                              }}
                            >
                              <IconContext.Provider value={{ size: "1.4em" }}>
                                <BiTerminal />
                              </IconContext.Provider>
                              &nbsp;&nbsp;cli/api driven workflow
                            </span>
                          )}
                        </Space>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </Content>
  );
};

function fixSshURL(source) {
  if (source.startsWith("git@")) {
    return source.replace(":", "/").replace("git@", "https://");
  } else {
    return source;
  }
}

function setupOrganizationIncludes(
  includes,
  setWorkspaces,
  setFilteredWorkspaces
) {
  let workspaces = [];

  includes.forEach((element) => {
    switch (element.type) {
      case include.WORKSPACE:
        //get latest job for workspace
        var lastJobId = element.relationships?.job?.data?.slice(-1)?.pop()?.id;
        var lastRunDate = includes.find(
          (x) => x.type === "job" && x.id === lastJobId
        )?.attributes?.updatedDate;
        var lastStatus =
          includes.find((x) => x.type === "job" && x.id === lastJobId)
            ?.attributes?.status ?? "never executed";
        console.log("id", lastJobId);
        workspaces.push({
          id: element.id,
          lastRun: lastRunDate,
          lastStatus: lastStatus,
          statusColor:
            lastStatus == "completed"
              ? "#2eb039"
              : lastStatus == "running"
              ? "#108ee9"
              : lastStatus == "waitingApproval"
              ? "#fa8f37"
              : lastStatus === "rejected"
              ? "#FB0136"
              : lastStatus === "failed"
              ? "#FB0136"
              : "",
          ...element.attributes,
        });
        break;
      default:
        break;
    }
  });

  setWorkspaces(workspaces);
  setFilteredWorkspaces(workspaces);
}
