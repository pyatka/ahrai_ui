import React from 'react';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
            <CDBSidebar textColor="#fff" backgroundColor="#333">
                <CDBSidebarContent className="sidebar-content">
                    <CDBSidebarMenu>
                        {/* <NavLink exact to="/" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="columns">Dashboard</CDBSidebarMenuItem>
                        </NavLink> */}
                        {/* <NavLink exact to="/tables" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="table">Tables</CDBSidebarMenuItem>
                        </NavLink> */}
                        <NavLink exact to="/employers" activeClassName="activeClicked">
                            <CDBSidebarMenuItem icon="users">Employers</CDBSidebarMenuItem>
                        </NavLink>
                        <NavLink exact to={`/day/${dd}/${mm}/${yyyy}`}>
                            <CDBSidebarMenuItem icon="calendar-day">Day</CDBSidebarMenuItem>
                        </NavLink>
                        <NavLink exact to={`positions`}>
                            <CDBSidebarMenuItem icon="map-pin">Positions</CDBSidebarMenuItem>
                        </NavLink>
                        {/* <NavLink exact to="/analytics" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="chart-line">
                            Analytics
                        </CDBSidebarMenuItem>
                        </NavLink> */}

                        {/* <NavLink
                        exact
                        to="/hero404"
                        target="_blank"
                        activeClassName="activeClicked"
                        >
                        <CDBSidebarMenuItem icon="exclamation-circle">
                            404 page
                        </CDBSidebarMenuItem>
                        </NavLink> */}
                    </CDBSidebarMenu>
                </CDBSidebarContent>

                {/* <CDBSidebarFooter style={{ textAlign: 'center' }}>
                <div
                    style={{
                    padding: '20px 5px',
                    }}
                >
                    Sidebar Footer
                </div>
                </CDBSidebarFooter> */}
            </CDBSidebar>
        </div>
    );
};

export default Sidebar;