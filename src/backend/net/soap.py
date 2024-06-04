from __future__ import annotations

from datetime import UTC, datetime, timedelta
from xml.etree import ElementTree
from xml.etree.ElementTree import Element, SubElement

import requests


def post_envelope(url: str, envelope: Envelope) -> Element:
    res = requests.post(
        url,
        ElementTree.tostring(envelope),
        headers={"content-type": "application/soap+xml; charset=utf-8"},
        timeout=10,
        verify=False,  # noqa: S501
    )

    if res.status_code != 200:
        error_msg = ElementTree.fromstring(res.content).findtext("./{*}Body/{*}Fault/{*}Reason/{*}Text")  # noqa: S314
        error_msg = error_msg if error_msg else "An unknown error has occurred."
        error_msg = error_msg.strip()
        error_msg = error_msg + "." if not error_msg.endswith(".") else error_msg
        raise SOAPError(error_msg)

    return ElementTree.fromstring(res.content)  # noqa: S314


class Envelope(Element):
    def __init__(self, url: str, element: Element) -> None:
        super().__init__(
            "s:Envelope",
            {"xmlns:a": "http://www.w3.org/2005/08/addressing", "xmlns:s": "http://www.w3.org/2003/05/soap-envelope"},
        )

        self.append(_Header(url, element.tag))

        body = SubElement(self, "s:Body")
        body.append(element)

        element.set("xmlns", _WUCLIENT)


class SOAPError(Exception):
    pass


_WUCLIENT = "http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService"
_WSU = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"


class _Header(Element):
    def __init__(self, url: str, method_name: str) -> None:
        super().__init__("s:Header")

        action = SubElement(self, "a:Action", {"s:mustUnderstand": "1"})
        action.text = _WUCLIENT + "/" + method_name
        message_id = SubElement(self, "a:MessageID")
        message_id.text = "urn:uuid:1a88ab88-d8eb-47bb-82d9-f2bd82654c6e"
        to = SubElement(self, "a:To", {"s:mustUnderstand": "1"})
        to.text = url
        security = SubElement(
            self,
            "o:Security",
            {
                "s:mustUnderstand": "1",
                "xmlns:o": "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
            },
        )
        timestamp = SubElement(security, "Timestamp", {"xmlns": _WSU})
        created = SubElement(timestamp, "Created")
        created.text = (created_time := datetime.now(UTC)).strftime("%Y-%m-%dT%H:%M:%SZ")
        expires = SubElement(timestamp, "Expires")
        expires.text = (created_time + timedelta(minutes=5)).strftime("%Y-%m-%dT%H:%M:%SZ")
        windows_update_tickets_token = SubElement(
            security,
            "wuws:WindowsUpdateTicketsToken",
            {
                "wsu:id": "ClientMSA",
                "xmlns:wsu": _WSU,
                "xmlns:wuws": "http://schemas.microsoft.com/msus/2014/10/WindowsUpdateAuthorization",
            },
        )
        windows_update_tickets_token.append(
            Element("TicketType", {"Name": "AAD", "Version": "1.0", "Policy": "MBI_SSL"}),
        )
